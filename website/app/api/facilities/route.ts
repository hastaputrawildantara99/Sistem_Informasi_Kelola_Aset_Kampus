import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ facilities });
  } catch (error) {
    console.error("GET FACILITIES ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data fasilitas" },
      { status: 500 }
    );
  }
}
