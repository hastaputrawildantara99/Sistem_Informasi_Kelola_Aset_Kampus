import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST: Buat Laporan Kerusakan Baru (User Story 6)
export async function POST(req: NextRequest) {
  try {
    const user: any = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Anda harus login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { facilityId, category, description, photoUrl } = body;

    if (!facilityId || !category || !description) {
      return NextResponse.json(
        { message: "Fasilitas, kategori, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        userId: Number(user.id),
        facilityId: Number(facilityId),
        category,
        description,
        photoUrl: photoUrl || null,
        status: "PENDING",
        updatedAt: new Date(),
      },
      include: {
        Facility: true,
      },
    });

    return NextResponse.json(
      { message: "Laporan kerusakan berhasil dikirim", report },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat membuat laporan" },
      { status: 500 }
    );
  }
}

// GET: Ambil Semua Laporan Publik & Statistik (User Story 7 & Dashboard)
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      include: {
        Facility: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            jenisUser: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalKerusakan = reports.length;
    const dalamPerbaikan = reports.filter(
      (r) => r.status === "IN_PROGRESS" || r.Facility.status === "MAINTENANCE"
    ).length;
    const laporanBaru = reports.filter((r) => r.status === "PENDING").length;
    const diselesaikan = reports.filter(
      (r) => r.status === "RESOLVED" || r.status === "CLOSED"
    ).length;

    return NextResponse.json({
      reports,
      stats: {
        totalKerusakan,
        dalamPerbaikan,
        laporanBaru,
        diselesaikan,
      },
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat mengambil data laporan" },
      { status: 500 }
    );
  }
}
