import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getCurrentUser();
    const userId = session?.id;
    if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId < 1) {
      return NextResponse.json({ message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== "PETUGAS") {
      return NextResponse.json({ message: "Endpoint ini hanya untuk petugas." }, { status: 403 });
    }

    const id = Number((await params).id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      return NextResponse.json({ message: "ID reservasi tidak valid." }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        facilityId: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        cancelledAt: true,
        cancellationReason: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, username: true } },
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
    });

    if (!reservation) {
      return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(
      { data: reservation },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Gagal mengambil detail reservasi petugas:", error);
    return NextResponse.json(
      { message: "Detail reservasi gagal dimuat." },
      { status: 500 },
    );
  }
}
