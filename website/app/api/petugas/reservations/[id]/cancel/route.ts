import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function parseReservationId(value: string): number | null {
  const id = Number(value);

  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id) || id > 2147483647) {
    return null;
  }

  return id;
}

export async function PATCH(
  request: Request,
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Body permintaan tidak valid." },
        { status: 400 },
      );
    }

    const reason =
      body !== null && typeof body === "object" && !Array.isArray(body)
        ? (body as { reason?: unknown }).reason
        : undefined;

    if (typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { message: "Alasan pembatalan wajib diisi." },
        { status: 400 },
      );
    }

    const cancellationReason = reason.trim();
    if (cancellationReason.length > 2000) {
      return NextResponse.json(
        { message: "Alasan pembatalan terlalu panjang." },
        { status: 400 },
      );
    }

    const response = await prisma.$transaction(
      async (tx) => {
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
          select: { id: true, status: true },
        });

        if (!reservation) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        if (reservation.status !== "APPROVED") {
          return NextResponse.json(
            {
              message:
                "Hanya reservasi berstatus APPROVED yang dapat dibatalkan oleh petugas.",
            },
            { status: 409 },
          );
        }

        const now = new Date();
        const cancelled = await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            cancellationReason,
          },
          select: {
            id: true,
            status: true,
            cancelledAt: true,
            cancellationReason: true,
            updatedAt: true,
          },
        });

        return NextResponse.json(
          { message: "Reservasi berhasil dibatalkan.", data: cancelled },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
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

    console.error("Gagal membatalkan reservasi petugas:", error);
    return NextResponse.json(
      { message: "Reservasi gagal dibatalkan." },
      { status: 500 },
    );
  }
}
