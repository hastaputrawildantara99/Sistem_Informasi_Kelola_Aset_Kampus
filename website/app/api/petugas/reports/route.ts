import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const reportStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type ReportStatus = (typeof reportStatuses)[number];
type PetugasAuthResult = { userId: number } | { error: NextResponse };

async function requirePetugas(): Promise<PetugasAuthResult> {
  const session = await getCurrentUser();
  const userId = session?.id;

  if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId < 1) {
    return { error: NextResponse.json({ message: "Silakan login terlebih dahulu." }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "PETUGAS") {
    return { error: NextResponse.json({ message: "Endpoint ini hanya untuk petugas." }, { status: 403 }) };
  }

  return { userId };
}

export async function GET(): Promise<NextResponse> {
  try {
    const auth = await requirePetugas();
    if ("error" in auth) return auth.error;

    const reports = await prisma.report.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        category: true,
        description: true,
        notes: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
        facility: { select: { id: true, name: true, location: true, type: true, status: true } },
      },
    });

    return NextResponse.json({ data: reports }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Gagal mengambil laporan petugas:", error);
    return NextResponse.json({ message: "Daftar laporan gagal dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requirePetugas();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
    }
    const input = body as { id?: unknown; status?: unknown; notes?: unknown } | null;
    const id = Number(input?.id);
    const status = input?.status as ReportStatus;
    const notes = typeof input?.notes === "string" ? input.notes.trim() : undefined;

    if (!Number.isSafeInteger(id) || id < 1 || !reportStatuses.includes(status)) {
      return NextResponse.json({ message: "ID atau status laporan tidak valid." }, { status: 400 });
    }
    if (status === "RESOLVED" && !notes) {
      return NextResponse.json({ message: "Catatan penyelesaian wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.report.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return NextResponse.json({ message: "Laporan tidak ditemukan." }, { status: 404 });
    if (existing.status === "RESOLVED" || existing.status === "CLOSED") {
      return NextResponse.json({ message: "Laporan yang sudah selesai tidak dapat diubah." }, { status: 409 });
    }
    if (status === "PENDING" || (status === "IN_PROGRESS" && existing.status !== "PENDING") || (status === "RESOLVED" && existing.status !== "IN_PROGRESS")) {
      return NextResponse.json({ message: "Perubahan status laporan tidak sesuai alur." }, { status: 409 });
    }

    const updateResult = await prisma.report.updateMany({
      where: { id, status: existing.status },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });

    if (updateResult.count !== 1) {
      return NextResponse.json({ message: "Status laporan berubah. Muat ulang data lalu coba lagi." }, { status: 409 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true, notes: true, updatedAt: true },
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error("Gagal memperbarui laporan petugas:", error);
    return NextResponse.json({ message: "Status laporan gagal diperbarui." }, { status: 500 });
  }
}
