import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gedung = searchParams.get('gedung');
    const bulan = searchParams.get('bulan');

    const facilities = await prisma.facility.findMany({
      include: {
        reservations: true,
        reports: true,
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const rekapData = facilities.map((fac) => {
      let filteredReservations = fac.reservations;
      let filteredReports = fac.reports;

      // Filter reservations by time if requested
      if (bulan === 'Bulan Ini') {
        filteredReservations = filteredReservations.filter((res) => {
          const d = new Date(res.startTime);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        filteredReports = filteredReports.filter((rep) => {
          const d = new Date(rep.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      } else if (bulan === 'Bulan Lalu') {
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
      } else if (bulan === 'Tahun Ini') {
        filteredReservations = filteredReservations.filter((res) => {
          const d = new Date(res.startTime);
          return d.getFullYear() === currentYear;
        });
        filteredReports = filteredReports.filter((rep) => {
          const d = new Date(rep.createdAt);
          return d.getFullYear() === currentYear;
        });
      }

      // Calculate total occupancy hours
      let totalMinutes = 0;
      filteredReservations.forEach((res) => {
        if (res.status === 'APPROVED' || res.status === 'PENDING') {
          const start = new Date(res.startTime).getTime();
          const end = new Date(res.endTime).getTime();
          if (end > start) {
            totalMinutes += (end - start) / (1000 * 60);
          }
        }
      });

      const jamOkupansi = Math.round(totalMinutes / 60);
      const jumlahKerusakan = filteredReports.length;

      let statusDisplay = 'Baik';
      if (fac.status === 'MAINTENANCE' || jumlahKerusakan >= 5) {
        statusDisplay = 'Perlu Perbaikan';
      } else if (jumlahKerusakan === 0 && fac.status === 'ACTIVE') {
        statusDisplay = 'Sangat Baik';
      }

      return {
        id: fac.id,
        fasilitas: fac.name,
        code: fac.code,
        gedung: fac.building || 'Gedung B',
        floor: fac.floor || '1',
        jamOkupansi,
        jumlahKerusakan,
        status: statusDisplay,
        rawStatus: fac.status,
        reports: filteredReports.map((r) => ({
          id: r.id,
          category: r.category,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
        })),
      };
    });

    // Filter by gedung if not 'Semua Gedung'
    const finalData = gedung && gedung !== 'Semua Gedung'
      ? rekapData.filter((d) => d.gedung === gedung)
      : rekapData;

    const totalJam = finalData.reduce((acc, curr) => acc + curr.jamOkupansi, 0);
    const totalInsiden = finalData.reduce((acc, curr) => acc + curr.jumlahKerusakan, 0);
    const fasilitasTerdampak = finalData.filter((d) => d.jumlahKerusakan > 0).length;
    const rataOkupansi = Math.round(totalJam / (finalData.length || 1));

    // Unique buildings
    const buildings = Array.from(new Set(facilities.map((f) => f.building).filter(Boolean)));

    return NextResponse.json({
      data: finalData,
      stats: {
        totalJam,
        rataOkupansi,
        totalInsiden,
        fasilitasTerdampak,
      },
      buildings: ['Semua Gedung', ...buildings],
    });
  } catch (error: any) {
    console.error('Error fetching rekap data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
