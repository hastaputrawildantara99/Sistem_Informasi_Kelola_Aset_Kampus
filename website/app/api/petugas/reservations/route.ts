import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
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

    const requestedStatus = new URL(request.url).searchParams.get("status");
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
    const where = validStatuses.includes(requestedStatus as (typeof validStatuses)[number])
      ? { status: requestedStatus as (typeof validStatuses)[number] }
      : undefined;

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        id: true,
        userId: true,
        facilityId: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        facility: {
          select: {
            id: true,
            code: true,
            name: true,
            building: true,
            floor: true,
            type: true,
            location: true,
            capacity: true,
            status: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(
      { data: reservations },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Gagal mengambil antrean reservasi petugas:", error);

    return NextResponse.json(
      { message: "Antrean reservasi gagal dimuat." },
      { status: 500 },
    );
  }
}
