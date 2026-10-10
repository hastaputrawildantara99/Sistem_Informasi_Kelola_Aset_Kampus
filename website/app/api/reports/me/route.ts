import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST: Buat Laporan Kerusakan Baru
export async function POST(req: NextRequest) {
  try {
    const user: any = await getCurrentUser();
    if (!user || !user.id) {
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

    const report = await (prisma.report as any).create({
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
        facility: true,
      },
    });

    return NextResponse.json(
      { message: "Laporan kerusakan berhasil dikirim", report: { ...report, Facility: report.facility } },
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

// GET: Ambil Laporan Khusus Pengguna Yang Sedang Login
export async function GET(req: NextRequest) {
  try {
    const user: any = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Anda harus login terlebih dahulu", reports: [] },
        { status: 401 }
      );
    }

    const userIdNum = Number(user.id);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { message: "ID User tidak valid", reports: [] },
        { status: 400 }
      );
    }

    // Ambil laporan HANYA milik user yang sedang login
    const reports: any[] = await (prisma.report as any).findMany({
      where: {
        userId: userIdNum,
      },
      include: {
        facility: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const responseReports = reports.map((item: any) => {
      const { facility, ...report } = item;
      return {
        ...report,
        Facility: facility,
      };
    });

    return NextResponse.json({
      reports: responseReports,
    });
  } catch (error) {
    console.error("GET MY REPORTS ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat mengambil laporan Anda", reports: [] },
      { status: 500 }
    );
  }
}
