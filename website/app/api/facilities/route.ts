import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FacilityType, Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type")?.trim();
  const location = searchParams.get("location")?.trim();
  const minCapacity = searchParams.get("minCapacity")?.trim();

  const where: Prisma.FacilityWhereInput = {
    status: {
      in: ["ACTIVE", "MAINTENANCE"],
    },
  };

  if (type) {
    const validTypes = Object.values(FacilityType);

    if (!validTypes.includes(type as FacilityType)) {
      return NextResponse.json(
        { message: "Tipe fasilitas tidak valid." },
        { status: 400 },
      );
    }

    where.type = type as FacilityType;
  }

  if (location) {
    where.location = {
      contains: location,
    };
  }

  if (minCapacity) {
    const capacity = Number(minCapacity);

    if (
      !/^\d+$/.test(minCapacity) ||
      !Number.isSafeInteger(capacity) ||
      capacity < 1 ||
      capacity > 2147483647
    ) {
      return NextResponse.json(
        { message: "Kapasitas minimum harus berupa bilangan bulat positif yang valid." },
        { status: 400 },
      );
    }

    where.capacity = {
      gte: capacity,
    };
  }

  try {
    const facilities = await prisma.facility.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        location: true,
        capacity: true,
        description: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      data: facilities,
    });
  } catch (error) {
    console.error("Gagal mengambil daftar fasilitas:", error);

    return NextResponse.json(
      { message: "Daftar fasilitas gagal dimuat." },
      { status: 500 },
    );
  }
}