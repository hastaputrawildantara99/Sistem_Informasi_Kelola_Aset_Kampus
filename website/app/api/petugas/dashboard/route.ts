import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
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

    const [
      totalReservations,
      pendingReservations,
      approvedReservations,
      rejectedReservations,
      cancelledReservations,
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      activeFacilities,
      maintenanceFacilities,
      reportQueue,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.reservation.count({ where: { status: "APPROVED" } }),
      prisma.reservation.count({ where: { status: "REJECTED" } }),
      prisma.reservation.count({ where: { status: "CANCELLED" } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "IN_PROGRESS" } }),
      prisma.report.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.facility.count({ where: { status: "ACTIVE" } }),
      prisma.facility.count({ where: { status: "MAINTENANCE" } }),
      prisma.report.findMany({
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5,
        select: {
          id: true,
          category: true,
          createdAt: true,
          status: true,
          user: { select: { name: true } },
          facility: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        data: {
          reservations: {
            total: totalReservations,
            pending: pendingReservations,
            approved: approvedReservations,
            rejected: rejectedReservations,
            cancelled: cancelledReservations,
          },
          reports: {
            total: totalReports,
            pending: pendingReports,
            inProgress: inProgressReports,
            resolved: resolvedReports,
            queue: reportQueue,
          },
          facilities: {
            active: activeFacilities,
            maintenance: maintenanceFacilities,
          },
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Gagal mengambil ringkasan dashboard petugas:", error);
    return NextResponse.json(
      { message: "Ringkasan dashboard gagal dimuat." },
      { status: 500 },
    );
  }
}
