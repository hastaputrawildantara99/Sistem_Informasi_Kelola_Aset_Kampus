import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    const userId = session?.id;
    if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId < 1) {
      return NextResponse.json({ message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== "PETUGAS") {
      return NextResponse.json({ message: "Endpoint ini hanya untuk petugas." }, { status: 403 });
    }

    const rawId = (await context.params).id;
    const id = Number(rawId);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
    }
    const status = (body as { status?: unknown } | null)?.status;
    if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id) || id > 2147483647 || !["ACTIVE", "MAINTENANCE"].includes(status as string)) {
      return NextResponse.json({ message: "ID atau status fasilitas tidak valid." }, { status: 400 });
    }

    const existing = await prisma.facility.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ message: "Fasilitas tidak ditemukan." }, { status: 404 });
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: { status: status as "ACTIVE" | "MAINTENANCE" },
      select: { id: true, status: true },
    });
    return NextResponse.json({ data: facility });
  } catch (error) {
    console.error("Gagal memperbarui fasilitas petugas:", error);
    return NextResponse.json({ message: "Status fasilitas gagal diperbarui." }, { status: 500 });
  }
}
