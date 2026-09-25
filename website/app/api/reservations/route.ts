import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BLOCKING_RESERVATION_STATUSES,
  ReservationRuleError,
  validateReservationTime,
} from "@/lib/reservations/rules";

export async function POST(request: Request) {
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

    // Periksa akun dan role terbaru dari database.
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
        { message: "Pengajuan reservasi hanya untuk akun pengguna." },
        { status: 403 },
      );
    }

    // 2. Baca dan validasi body JSON.
    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

    if (contentType !== "application/json") {
      return NextResponse.json(
        { message: "Gunakan Content-Type application/json." },
        { status: 415 },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Data reservasi harus berupa objek JSON." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const facilityId = input.facilityId;
    const purpose =
      typeof input.purpose === "string" ? input.purpose.trim() : "";

    if (
      typeof facilityId !== "number" ||
      !Number.isSafeInteger(facilityId) ||
      facilityId < 1 ||
      facilityId > 2147483647
    ) {
      return NextResponse.json(
        { message: "ID fasilitas harus berupa bilangan bulat positif." },
        { status: 400 },
      );
    }

    if (!purpose || purpose.length > 2000) {
      return NextResponse.json(
        { message: "Tujuan penggunaan wajib diisi, maksimal 2000 karakter." },
        { status: 400 },
      );
    }

    // Tolak waktu tidak valid sebelum membuka transaksi.
    validateReservationTime(input);

    // 3. Periksa fasilitas, bentrok, dan simpan dalam satu transaksi.
    const response = await prisma.$transaction(
      async (tx) => {
        // Kunci baris fasilitas selama transaksi berlangsung.
        const facilities = await tx.$queryRaw<
          { id: number; status: string }[]
        >`
          SELECT id, status
          FROM Facility
          WHERE id = ${facilityId}
          FOR UPDATE
        `;

        const facility = facilities[0];

        if (!facility) {
          return NextResponse.json(
            { message: "Fasilitas tidak ditemukan." },
            { status: 404 },
          );
        }

        if (facility.status !== "ACTIVE") {
          return NextResponse.json(
            { message: "Fasilitas sedang tidak dapat dipesan." },
            { status: 409 },
          );
        }

        // Periksa lagi waktu setelah mendapatkan kunci fasilitas.
        const { startTime, endTime } = validateReservationTime(input);

        const conflict = await tx.reservation.findFirst({
          where: {
            facilityId,
            status: {
              in: [...BLOCKING_RESERVATION_STATUSES],
            },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });

        if (conflict) {
          return NextResponse.json(
            { message: "Waktu yang dipilih bentrok dengan reservasi disetujui." },
            { status: 409 },
          );
        }

        const reservation = await tx.reservation.create({
          data: {
            userId: user.id,
            facilityId,
            startTime,
            endTime,
            purpose,
            status: "PENDING",
          },
          select: {
            id: true,
            facilityId: true,
            startTime: true,
            endTime: true,
            purpose: true,
            status: true,
            createdAt: true,
          },
        });

        return NextResponse.json(
          {
            message: "Reservasi berhasil diajukan.",
            data: reservation,
          },
          { status: 201 },
        );
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Format JSON tidak valid." },
        { status: 400 },
      );
    }

    if (error instanceof ReservationRuleError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: 400 },
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

    console.error("Gagal membuat reservasi:", error);

    return NextResponse.json(
      { message: "Reservasi gagal diajukan." },
      { status: 500 },
    );
  }
}
