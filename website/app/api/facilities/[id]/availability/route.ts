import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  BLOCKING_RESERVATION_STATUSES,
  CAMPUS_TIME_ZONE,
  ReservationRuleError,
  createOperatingSlots,
  getAvailabilitySlots,
} from "@/lib/reservations/rules";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const facilityId = Number(id);

    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(facilityId) ||
      facilityId > 2147483647
    ) {
      return NextResponse.json(
        { message: "ID fasilitas tidak valid." },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // Sekaligus memvalidasi tanggal dan menentukan batas operasional.
    const operatingSlots = createOperatingSlots(date);
    const openingTime = operatingSlots[0].startTime;
    const closingTime =
      operatingSlots[operatingSlots.length - 1].endTime;

    const facility = await prisma.facility.findUnique({
      where: {
        id: facilityId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        reservations: {
          where: {
            status: {
              in: [...BLOCKING_RESERVATION_STATUSES],
            },
            startTime: {
              lt: closingTime,
            },
            endTime: {
              gt: openingTime,
            },
          },
          select: {
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    if (!facility || facility.status === "INACTIVE") {
      return NextResponse.json(
        { message: "Fasilitas tidak ditemukan." },
        { status: 404 },
      );
    }

    const slots = getAvailabilitySlots(
      date,
      facility.status,
      facility.reservations,
    );

    return NextResponse.json(
      {
        data: {
          facility: {
            id: facility.id,
            name: facility.name,
            status: facility.status,
          },
          date,
          timeZone: CAMPUS_TIME_ZONE,
          slots: slots.map((slot) => ({
            startTime: slot.startLabel,
            endTime: slot.endLabel,
            available: slot.available,
          })),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof ReservationRuleError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
        },
        { status: 400 },
      );
    }

    console.error("Gagal mengambil ketersediaan fasilitas:", error);

    return NextResponse.json(
      { message: "Ketersediaan fasilitas gagal dimuat." },
      { status: 500 },
    );
  }
}