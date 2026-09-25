import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  assertUserCanCancel,
  ReservationRuleError,
} from "@/lib/reservations/rules";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Periksa sesi login.
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

    if (user.role !== "USER") {
      return NextResponse.json(
        { message: "Endpoint ini hanya untuk pembatalan oleh pengguna." },
        { status: 403 },
      );
    }

    // 2. Validasi ID reservasi.
    const { id } = await params;
    const reservationId = Number(id);

    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(reservationId) ||
      reservationId > 2147483647
    ) {
      return NextResponse.json(
        { message: "ID reservasi tidak valid." },
        { status: 400 },
      );
    }

    // 3. Periksa dan ubah reservasi dalam satu transaksi.
    const response = await prisma.$transaction(
      async (tx) => {
        // Kunci hanya record yang dimiliki pengguna ini.
        const lockedRows = await tx.$queryRaw<{ id: number }[]>`
          SELECT id
          FROM Reservation
          WHERE id = ${reservationId}
            AND userId = ${user.id}
          FOR UPDATE
        `;

        if (lockedRows.length === 0) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        // Baca kondisi terbaru setelah kunci didapatkan.
        const reservation = await tx.reservation.findFirst({
          where: {
            id: reservationId,
            userId: user.id,
          },
          select: {
            id: true,
            userId: true,
            status: true,
            startTime: true,
          },
        });

        if (!reservation) {
          return NextResponse.json(
            { message: "Reservasi tidak ditemukan." },
            { status: 404 },
          );
        }

        const now = new Date();

        // Memeriksa pemilik, status, dan batas 24 jam.
        assertUserCanCancel(reservation, user.id, now);

        const cancelled = await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            cancellationReason: "Dibatalkan oleh pemilik reservasi.",
          },
          select: {
            id: true,
            facilityId: true,
            startTime: true,
            endTime: true,
            purpose: true,
            status: true,
            cancelledAt: true,
            cancellationReason: true,
            updatedAt: true,
          },
        });

        return NextResponse.json(
          {
            message: "Reservasi berhasil dibatalkan.",
            data: cancelled,
          },
          {
            headers: {
              "Cache-Control": "private, no-store",
            },
          },
        );
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return response;
  } catch (error) {
    if (error instanceof ReservationRuleError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
        },
        {
          status: error.code === "FORBIDDEN" ? 403 : 409,
        },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2034", "P2028"].includes(error.code)
    ) {
      return NextResponse.json(
        { message: "Transaksi belum berhasil. Silakan coba kembali." },
        { status: 409 },
      );
    }

    console.error("Gagal membatalkan reservasi:", error);

    return NextResponse.json(
      { message: "Reservasi gagal dibatalkan." },
      { status: 500 },
    );
  }
}