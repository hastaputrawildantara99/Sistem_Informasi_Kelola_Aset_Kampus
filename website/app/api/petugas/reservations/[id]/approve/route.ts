import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BLOCKING_RESERVATION_STATUSES } from "@/lib/reservations/rules";

function parseReservationId(value: string): number | null {
  const id = Number(value);

  if (
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(id) ||
    id > 2147483647
  ) {
    return null;
  }

  return id;
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getCurrentUser();
    const userId = session?.id;

    if (
      typeof userId !== "number" ||
      !Number.isSafeInteger(userId) ||
      userId < 1 ||
      userId > 2147483647
    ) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan. Silakan login kembali." },
        { status: 401 },
      );
    }

    if (user.role !== "PETUGAS") {
      return NextResponse.json(
        { message: "Endpoint ini hanya untuk petugas." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const reservationId = parseReservationId(id);

    if (reservationId === null) {
      return NextResponse.json(
        { message: "ID reservasi tidak valid." },
        { status: 400 },
      );
    }

    const response = await prisma.$transaction(
      async (tx) => {
        // Baca fasilitas terlebih dahulu agar urutan lock konsisten dengan
        // endpoint pembuatan reservasi yang mengunci Facility lebih dulu.
        const reservationReference = await tx.$queryRaw<
          { id: number; facilityId: number }[]
        >`
          SELECT id, facilityId
          FROM Reservation
          WHERE id = ${reservationId}
        `;

        const reference = reservationReference[0];

        if (!reference) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        const lockedFacilities = await tx.$queryRaw<
          { id: number; status: string }[]
        >`
          SELECT id, status
          FROM Facility
          WHERE id = ${reference.facilityId}
          FOR UPDATE
        `;

        const facility = lockedFacilities[0];

        if (!facility) {
          return NextResponse.json(
            { message: "Fasilitas reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        if (facility.status !== "ACTIVE") {
          return NextResponse.json(
            { message: "Fasilitas sedang tidak dapat dipesan." },
            { status: 409 },
          );
        }

        const lockedReservations = await tx.$queryRaw<{ id: number }[]>`
          SELECT id
          FROM Reservation
          WHERE id = ${reservationId}
          FOR UPDATE
        `;

        if (lockedReservations.length === 0) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        const reservation = await tx.reservation.findUnique({
          where: { id: reservationId },
          select: {
            id: true,
            facilityId: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        });

        if (!reservation) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        if (reservation.status !== "PENDING") {
          return NextResponse.json(
            { message: "Hanya reservasi berstatus PENDING yang dapat disetujui." },
            { status: 409 },
          );
        }

        const conflict = await tx.reservation.findFirst({
          where: {
            facilityId: reservation.facilityId,
            id: { not: reservation.id },
            status: {
              in: [...BLOCKING_RESERVATION_STATUSES],
            },
            startTime: { lt: reservation.endTime },
            endTime: { gt: reservation.startTime },
          },
          select: {
            id: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        });

        if (conflict) {
          return NextResponse.json(
            {
              message:
                "Reservasi tidak dapat disetujui karena waktunya bentrok dengan reservasi lain pada fasilitas yang sama.",
              conflict: {
                id: conflict.id,
                status: conflict.status,
                startTime: conflict.startTime,
                endTime: conflict.endTime,
              },
            },
            { status: 409 },
          );
        }

        const approved = await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: "APPROVED" },
          select: {
            id: true,
            userId: true,
            facilityId: true,
            startTime: true,
            endTime: true,
            purpose: true,
            status: true,
            updatedAt: true,
          },
        });

        return NextResponse.json({
          message: "Reservasi berhasil disetujui.",
          data: approved,
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2034", "P2028"].includes(error.code)
    ) {
      return NextResponse.json(
        { message: "Transaksi belum berhasil. Silakan coba kembali." },
        { status: 409 },
      );
    }

    console.error("Gagal menyetujui reservasi petugas:", error);

    return NextResponse.json(
      { message: "Reservasi gagal disetujui." },
      { status: 500 },
    );
  }
}
