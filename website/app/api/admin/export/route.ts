import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const facilities = await prisma.facility.findMany({
      include: {
        reservations: true,
        reports: true,
      },
      orderBy: { name: 'asc' },
    });

    const rows = facilities.map((fac) => {
      let totalMinutes = 0;
      fac.reservations.forEach((res) => {
        if (res.status === 'APPROVED' || res.status === 'PENDING') {
          const start = new Date(res.startTime).getTime();
          const end = new Date(res.endTime).getTime();
          if (end > start) {
            totalMinutes += (end - start) / (1000 * 60);
          }
        }
      });
      const hours = Math.round(totalMinutes / 60);
      const reportsCount = fac.reports.length;
      const status = fac.status === 'MAINTENANCE' ? 'Perlu Perbaikan' : (reportsCount === 0 ? 'Sangat Baik' : 'Baik');

      return {
        id: fac.id,
        name: fac.name,
        code: fac.code,
        building: fac.building,
        floor: fac.floor,
        capacity: fac.capacity,
        hours,
        reportsCount,
        status,
        operasional: fac.status,
      };
    });

    if (format === 'csv' || format === 'excel') {
      const headers = ['ID', 'Nama Fasilitas', 'Kode', 'Gedung', 'Lantai', 'Kapasitas', 'Jam Okupansi', 'Jumlah Kerusakan', 'Kondisi', 'Status Operasional'];
      const csvLines = [
        headers.join(','),
        ...rows.map((r) => [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.code}"`,
          `"${r.building}"`,
          `"${r.floor}"`,
          r.capacity,
          r.hours,
          r.reportsCount,
          `"${r.status}"`,
          `"${r.operasional}"`,
        ].join(',')),
      ].join('\r\n');

      const contentType = format === 'csv' 
        ? 'text/csv; charset=utf-8' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filename = `rekap_sikak_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;

      return new NextResponse(csvLines, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'pdf' || format === 'txt') {
      let text = `=========================================================\n`;
      text += `          LAPORAN REKAPITULASI FASILITAS KAMPUS SIKAK       \n`;
      text += `=========================================================\n`;
      text += `Dicetak pada: ${new Date().toLocaleString('id-ID')}\n\n`;
      text += `RINGKASAN DATA:\n`;
      text += `Total Fasilitas    : ${rows.length}\n`;
      text += `Total Jam Okupansi : ${rows.reduce((a, b) => a + b.hours, 0)} Jam\n`;
      text += `Total Laporan      : ${rows.reduce((a, b) => a + b.reportsCount, 0)} Insiden\n\n`;
      text += `DAFTAR FASILITAS:\n`;
      text += `---------------------------------------------------------\n`;
      rows.forEach((r, idx) => {
        text += `${idx + 1}. [${r.code}] ${r.name} (${r.building} Lt.${r.floor})\n`;
        text += `   - Okupansi : ${r.hours} Jam\n`;
        text += `   - Kerusakan: ${r.reportsCount} Laporan\n`;
        text += `   - Status   : ${r.status} (${r.operasional})\n\n`;
      });
      text += `=========================================================\n`;

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="rekap_sikak_${Date.now()}.txt"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in export route:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data' }, { status: 500 });
  }
}
