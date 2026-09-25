import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
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
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan. Silakan login kembali." },
        { status: 401 },
      );
    }

    if (user.role !== "USER") {
      return NextResponse.json(
        { message: "Detail reservasi pribadi hanya untuk akun pengguna." },
        { status: 403 },
      );
    }

    // 2. Validasi ID reservasi dari URL.
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

    // 3. Cari berdasarkan ID reservasi DAN pemiliknya.
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: user.id,
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
        createdAt: true,
        updatedAt: true,
        facility: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            location: true,
            capacity: true,
            status: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservasi tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data: reservation },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Gagal mengambil detail reservasi:", error);

    return NextResponse.json(
      { message: "Detail reservasi gagal dimuat." },
      { status: 500 },
    );
  }
}