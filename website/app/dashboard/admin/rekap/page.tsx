'use client';

import { useState } from 'react';
import { FileText, Download, Filter, BarChart3, Calendar, Building, Clock, AlertTriangle } from 'lucide-react';

export default function RekapPage() {
  const [gedung, setGedung] = useState('Semua Gedung');
  const [bulan, setBulan] = useState('Bulan Ini');

  const mockData = [
    { fasilitas: 'Ruang Kelas A', jamOkupansi: 120, jumlahKerusakan: 2, status: 'Baik', gedung: 'Gedung A' },
    { fasilitas: 'Lab Komputer', jamOkupansi: 180, jumlahKerusakan: 5, status: 'Perlu Perbaikan', gedung: 'Gedung B' },
    { fasilitas: 'Aula Utama', jamOkupansi: 45, jumlahKerusakan: 0, status: 'Sangat Baik', gedung: 'Gedung Pusat' },
    { fasilitas: 'Ruang Rapat 1', jamOkupansi: 80, jumlahKerusakan: 1, status: 'Baik', gedung: 'Gedung A' },
    { fasilitas: 'Perpustakaan', jamOkupansi: 200, jumlahKerusakan: 3, status: 'Baik', gedung: 'Gedung Pusat' },
  ];

  const filteredData = mockData.filter(d => gedung === 'Semua Gedung' || d.gedung === gedung);

  const stats = {
    totalJam: filteredData.reduce((acc, curr) => acc + curr.jamOkupansi, 0),
    rataOkupansi: Math.round(filteredData.reduce((acc, curr) => acc + curr.jamOkupansi, 0) / (filteredData.length || 1)),
    totalInsiden: filteredData.reduce((acc, curr) => acc + curr.jumlahKerusakan, 0),
    fasilitasTerdampak: filteredData.filter(d => d.jumlahKerusakan > 0).length
  };

  const handleExportCSV = () => {
    const headers = ['Fasilitas', 'Jam Okupansi', 'Jumlah Kerusakan', 'Status', 'Gedung'];
    const rows = filteredData.map(d => [d.fasilitas, d.jamOkupansi, d.jumlahKerusakan, d.status, d.gedung]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_laporan_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Generates CSV content but downloads as .xlsx as requested
    const headers = ['Fasilitas', 'Jam Okupansi', 'Jumlah Kerusakan', 'Status', 'Gedung'];
    const rows = filteredData.map(d => [d.fasilitas, d.jamOkupansi, d.jumlahKerusakan, d.status, d.gedung]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_laporan_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    let reportText = `LAPORAN REKAPITULASI SIKAK\n`;
    reportText += `Tanggal Cetak: ${new Date().toLocaleString()}\n`;
    reportText += `Filter Gedung: ${gedung}\n`;
    reportText += `Filter Waktu: ${bulan}\n\n`;
    
    reportText += `RINGKASAN STATISTIK:\n`;
    reportText += `- Total Jam Terpakai: ${stats.totalJam} Jam\n`;
    reportText += `- Rata-rata Okupansi: ${stats.rataOkupansi} Jam/Fasilitas\n`;
    reportText += `- Total Insiden Kerusakan: ${stats.totalInsiden}\n`;
    reportText += `- Fasilitas Terdampak: ${stats.fasilitasTerdampak}\n\n`;
    
    reportText += `DATA DETAIL:\n`;
    filteredData.forEach((d, i) => {
      reportText += `${i+1}. ${d.fasilitas} (${d.gedung}) - Okupansi: ${d.jamOkupansi} Jam, Kerusakan: ${d.jumlahKerusakan}, Status: ${d.status}\n`;
    });

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_laporan_${new Date().getTime()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45]">Rekap & Laporan</h1>
          <p className="text-gray-600 mt-1">Analytics dan export data sistem</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-2 p-2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <select 
              value={gedung}
              onChange={(e) => setGedung(e.target.value)}
              className="text-sm font-medium outline-none bg-transparent cursor-pointer text-gray-700"
            >
              <option value="Semua Gedung">Semua Gedung</option>
              <option value="Gedung A">Gedung A</option>
              <option value="Gedung B">Gedung B</option>
              <option value="Gedung Pusat">Gedung Pusat</option>
            </select>
            <div className="w-px h-5 bg-gray-200"></div>
            <select 
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="text-sm font-medium outline-none bg-transparent cursor-pointer text-gray-700"
            >
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Bulan Lalu">Bulan Lalu</option>
              <option value="Tahun Ini">Tahun Ini</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm text-sm">
              <Download size={16} /> PDF/TXT
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm">
              <Download size={16} /> Excel
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
              <Download size={16} /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Jam Terpakai</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalJam}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#006B45]/10 text-[#006B45] rounded-full flex items-center justify-center shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rata-rata Okupansi</p>
            <p className="text-2xl font-bold text-gray-800">{stats.rataOkupansi}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Insiden</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalInsiden}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fasl. Terdampak</p>
            <p className="text-2xl font-bold text-gray-800">{stats.fasilitasTerdampak}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#006B45]/10 text-[#006B45] rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Okupansi Fasilitas (Jam)</h2>
          </div>
          <div className="space-y-4">
            {filteredData.map((d, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{d.fasilitas}</span>
                  <span className="text-gray-500">{d.jamOkupansi} Jam</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#006B45] h-2.5 rounded-full" style={{ width: `${Math.min((d.jamOkupansi / 200) * 100, 100)}%` }}></div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">Tidak ada data untuk filter ini</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Daftar Kerusakan</h2>
          </div>
          <div className="space-y-3">
            {filteredData.filter(d => d.jumlahKerusakan > 0).map((d, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    {d.jumlahKerusakan}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{d.fasilitas}</p>
                    <p className="text-xs text-gray-500">{d.gedung}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  {d.status}
                </span>
              </div>
            ))}
            {filteredData.filter(d => d.jumlahKerusakan > 0).length === 0 && (
              <div className="text-center py-8 text-gray-500">Tidak ada kerusakan dilaporkan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
