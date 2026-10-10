import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface RekapExportItem {
  id: number;
  fasilitas: string;
  code: string;
  gedung: string;
  floor: string;
  jamOkupansi: number;
  jumlahKerusakan: number;
  status: string;
}

export interface ExportStats {
  totalJam: number;
  rataOkupansi: number;
  totalInsiden: number;
  fasilitasTerdampak: number;
}

/**
 * Ekspor data ke format Excel (.xlsx) murni
 */
export function exportRekapToExcel(
  items: RekapExportItem[],
  stats: ExportStats,
  filters: { gedung: string; bulan: string }
) {
  // 1. Sheet Rekap Fasilitas
  const excelRows = items.map((item, index) => ({
    No: index + 1,
    'Kode Fasilitas': item.code,
    'Nama Fasilitas': item.fasilitas,
    Gedung: item.gedung,
    Lantai: item.floor,
    'Jam Okupansi (Jam)': item.jamOkupansi,
    'Jumlah Kerusakan (Laporan)': item.jumlahKerusakan,
    'Kondisi Fasilitas': item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Kode
    { wch: 30 }, // Nama
    { wch: 18 }, // Gedung
    { wch: 10 }, // Lantai
    { wch: 20 }, // Jam Okupansi
    { wch: 26 }, // Jumlah Kerusakan
    { wch: 20 }, // Kondisi
  ];

  // 2. Sheet Ringkasan Statistik
  const summaryRows = [
    { Metrik: 'Filter Gedung', Nilai: filters.gedung },
    { Metrik: 'Filter Waktu', Nilai: filters.bulan },
    { Metrik: 'Tanggal Unduh', Nilai: new Date().toLocaleString('id-ID') },
    { Metrik: 'Total Jam Terpakai', Nilai: `${stats.totalJam} Jam` },
    { Metrik: 'Rata-rata Okupansi', Nilai: `${stats.rataOkupansi} Jam/Fasilitas` },
    { Metrik: 'Total Insiden Kerusakan', Nilai: `${stats.totalInsiden} Kasus` },
    { Metrik: 'Fasilitas Terdampak', Nilai: `${stats.fasilitasTerdampak} Fasilitas` },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 35 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Fasilitas');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  const filename = `Laporan_Rekap_SIKAK_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Ekspor data ke format PDF (.pdf) resmi dan berstandar dokumen
 */
export function exportRekapToPDF(
  items: RekapExportItem[],
  stats: ExportStats,
  filters: { gedung: string; bulan: string }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Background Banner
  doc.setFillColor(0, 107, 69); // #006B45 (Warna Kampus SIKAK)
  doc.rect(0, 0, 210, 24, 'F');

  // Title in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEM INFORMASI KELOLA ASET KAMPUS (SIKAK)', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Rekapitulasi Okupansi & Frekuensi Kerusakan Fasilitas', 14, 18);

  // Metadata Box
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(8.5);
  doc.text(`Tanggal Cetak : ${new Date().toLocaleString('id-ID')}`, 14, 32);
  doc.text(`Filter Gedung : ${filters.gedung}`, 14, 37);
  doc.text(`Filter Waktu  : ${filters.bulan}`, 14, 42);

  // Statistics Summary Cards
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 46, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL JAM TERPAKAI', 18, 52);
  doc.text('RATA-RATA OKUPANSI', 64, 52);
  doc.text('TOTAL INSIDEN', 114, 52);
  doc.text('FASILITAS TERDAMPAK', 154, 52);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 69);
  doc.text(`${stats.totalJam} Jam`, 18, 60);
  doc.text(`${stats.rataOkupansi} Jam`, 64, 60);

  doc.setTextColor(220, 53, 69);
  doc.text(`${stats.totalInsiden}`, 114, 60);
  doc.text(`${stats.fasilitasTerdampak}`, 154, 60);

  // Table using AutoTable
  const tableData = items.map((item, idx) => [
    idx + 1,
    item.code,
    item.fasilitas,
    item.gedung,
    `Lt. ${item.floor}`,
    `${item.jamOkupansi} Jam`,
    `${item.jumlahKerusakan}`,
    item.status,
  ]);

  autoTable(doc, {
    startY: 69,
    head: [['No', 'Kode', 'Nama Fasilitas', 'Gedung', 'Lantai', 'Okupansi', 'Kerusakan', 'Kondisi']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 107, 69],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 46 },
      3: { cellWidth: 28 },
      4: { cellWidth: 16 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
    },
    didDrawPage: (data) => {
      // Footer page number
      const str = `Halaman ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(str, 196 - doc.getTextWidth(str), 290);
      doc.text('Dokumen Resmi SIKAK - Modul Rekap Admin', 14, 290);
    },
  });

  const filename = `Laporan_Rekap_SIKAK_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Ekspor data ke format CSV dengan UTF-8 BOM untuk kompatibilitas Excel
 */
export function exportRekapToCSV(
  items: RekapExportItem[],
  _stats: ExportStats,
  _filters: { gedung: string; bulan: string }
) {
  const headers = ['No', 'Kode Fasilitas', 'Nama Fasilitas', 'Gedung', 'Lantai', 'Jam Okupansi', 'Jumlah Kerusakan', 'Kondisi'];
  const rows = items.map((item, idx) => [
    idx + 1,
    `"${item.code}"`,
    `"${item.fasilitas.replace(/"/g, '""')}"`,
    `"${item.gedung}"`,
    `"${item.floor}"`,
    item.jamOkupansi,
    item.jumlahKerusakan,
    `"${item.status}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Laporan_Rekap_SIKAK_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
