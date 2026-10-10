import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    const occupancyData = facilities.map((fac) => {
      let totalMinutes = 0;
      fac.reservations.forEach((res) => {
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
        reportCount: fac.reports.length,
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

    const totalHours = occupancyData.reduce((acc, curr) => acc + curr.hours, 0);
    const totalReports = incidentData.reduce((acc, curr) => acc + curr.reportCount, 0);

    return NextResponse.json({
      totalFacilities,
      activeFacilities,
      inactiveFacilities,
      pendingVerifications,
      totalStaff,
      activeStaff,
      totalHours,
      totalReports,
      averageOccupancy: totalFacilities > 0 ? Math.round(totalHours / totalFacilities) : 0,
      occupancyData,
      incidentData,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
