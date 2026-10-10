import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const newFacility = await prisma.facility.create({
      data: {
        name: "Laboratorium Komputer C",
        code: "LAB-KOMP-C-01",
        building: "Gedung E",
        floor: "Lantai 2",
        location: "Ruang 204",
        capacity: 30,
        type: "LABORATORY",
        status: "ACTIVE",
        description: "Lab Komputer Pemrograman",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Berhasil menambah 1 fasilitas!",
      facility: newFacility,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menambah data", error: String(error) },
      { status: 500 }
    );
  }
}
