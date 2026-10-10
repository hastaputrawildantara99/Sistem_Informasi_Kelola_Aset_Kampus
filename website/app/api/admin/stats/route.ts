import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan') || 'Bulan Ini';
    const gedung = searchParams.get('gedung');

    const totalFacilities = await prisma.facility.count();
    const activeFacilities = await prisma.facility.count({ where: { status: 'ACTIVE' } });
    const inactiveFacilities = await prisma.facility.count({ 
      where: { status: { in: ['INACTIVE', 'MAINTENANCE'] } } 
    });

    // Unverified users
    const pendingVerifications = await prisma.user.count({ 
      where: { verified: false } 
    });

    const totalStaff = await prisma.user.count({ where: { role: 'PETUGAS' } });
    const activeStaff = await prisma.user.count({ 
      where: { role: 'PETUGAS', verified: true } 
    });

    // Facility occupancy and incidents
    const facilities = await prisma.facility.findMany({
      include: {
        reservations: true,
        reports: true,
      },
      orderBy: { id: 'asc' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const occupancyData = facilities.map((fac) => {
      let filteredReservations = fac.reservations;
      let filteredReports = fac.reports;

      if (bulan === 'Bulan Ini' || bulan.includes('Bulan Ini') || bulan.includes('Oktober')) {
        filteredReservations = filteredReservations.filter((res) => {
          const d = new Date(res.startTime);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        filteredReports = filteredReports.filter((rep) => {
          const d = new Date(rep.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      } else if (bulan === 'Bulan Lalu' || bulan.includes('September')) {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        filteredReservations = filteredReservations.filter((res) => {
          const d = new Date(res.startTime);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });
        filteredReports = filteredReports.filter((rep) => {
          const d = new Date(rep.createdAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });
      } else if (bulan === 'Tahun Ini' || bulan === '2026') {
        filteredReservations = filteredReservations.filter((res) => {
          const d = new Date(res.startTime);
          return d.getFullYear() === currentYear;
        });
        filteredReports = filteredReports.filter((rep) => {
          const d = new Date(rep.createdAt);
          return d.getFullYear() === currentYear;
        });
      }
      // If 'Semua Waktu', do not filter by time -> includes all historical data

      let totalMinutes = 0;
      filteredReservations.forEach((res) => {
        // Count confirmed/approved and pending usage
        if (res.status === 'APPROVED' || res.status === 'PENDING') {
          const start = new Date(res.startTime).getTime();
          const end = new Date(res.endTime).getTime();
          if (end > start) {
            totalMinutes += (end - start) / (1000 * 60);
          }
        }
      });
      const hours = Math.round(totalMinutes / 60);
      return {
        id: fac.id,
        name: fac.name,
        code: fac.code,
        building: fac.building,
        hours: hours || 0,
        reportCount: filteredReports.length,
        status: fac.status,
      };
    });

    const incidentData = facilities
      .map((fac) => ({
        id: fac.id,
        name: fac.name,
        code: fac.code,
        building: fac.building,
        reportCount: fac.reports.length,
        latestCategory: fac.reports[0]?.category || 'Sarana & Prasarana',
      }))
      .sort((a, b) => b.reportCount - a.reportCount);

    // Apply building filter if requested
    const filteredOccupancyData = gedung && gedung !== 'Semua Gedung'
      ? occupancyData.filter((d) => d.building === gedung)
      : occupancyData;

    const filteredIncidentData = gedung && gedung !== 'Semua Gedung'
      ? incidentData.filter((d) => d.building === gedung)
      : incidentData;

    const totalHours = filteredOccupancyData.reduce((acc, curr) => acc + curr.hours, 0);
    const totalReports = filteredIncidentData.reduce((acc, curr) => acc + curr.reportCount, 0);

    const buildings = Array.from(new Set(facilities.map((f) => f.building).filter(Boolean)));

    return NextResponse.json({
      totalFacilities,
      activeFacilities,
      inactiveFacilities,
      pendingVerifications,
      totalStaff,
      activeStaff,
      totalHours,
      totalReports,
      averageOccupancy: filteredOccupancyData.length > 0 ? Math.round(totalHours / filteredOccupancyData.length) : 0,
      occupancyData,
      incidentData,
      buildings: ['Semua Gedung', ...buildings],
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

