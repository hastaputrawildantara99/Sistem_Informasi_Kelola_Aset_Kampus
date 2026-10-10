'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  Building, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  exportRekapToPDF, 
  exportRekapToExcel, 
  exportRekapToCSV, 
  RekapExportItem, 
  ExportStats 
} from '@/lib/exportHelper';

export default function RekapPage() {
  const [gedung, setGedung] = useState('Semua Gedung');
  const [bulan, setBulan] = useState('Bulan Ini');
  const [rekapData, setRekapData] = useState<RekapExportItem[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<string[]>(['Semua Gedung']);
  const [stats, setStats] = useState<ExportStats>({
    totalJam: 0,
    rataOkupansi: 0,
    totalInsiden: 0,
    fasilitasTerdampak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3500);
  };

  // Fetch Rekap Data from Database API
  const fetchRekapData = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (gedung && gedung !== 'Semua Gedung') query.append('gedung', gedung);
      if (bulan) query.append('bulan', bulan);

      const res = await fetch(`/api/admin/rekap?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Gagal mengambil data rekap dari database');
      }

      const result = await res.json();
      setRekapData(result.data || []);
      setStats(result.stats || {
        totalJam: 0,
        rataOkupansi: 0,
        totalInsiden: 0,
        fasilitasTerdampak: 0,
      });

      if (result.buildings && result.buildings.length > 0) {
        setAvailableBuildings(result.buildings);
      }
    } catch (err: any) {
      console.error('Error fetching rekap:', err);
      showToast(err.message || 'Gagal memuat rekap', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [gedung, bulan]);

  useEffect(() => {
    fetchRekapData();
  }, [fetchRekapData]);

  // Export handlers using genuine PDF, Excel, and CSV generators
  const handleExportPDF = () => {
    if (rekapData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToPDF(rekapData, stats, { gedung, bulan });
      showToast('Laporan PDF resmi berhasil diunduh (.pdf)', 'success');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('Gagal membuat dokumen PDF', 'error');
    }
  };

  const handleExportExcel = () => {
    if (rekapData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToExcel(rekapData, stats, { gedung, bulan });
      showToast('File Excel resmi berhasil diunduh (.xlsx)', 'success');
    } catch (err: any) {
      console.error('Excel export error:', err);
      showToast('Gagal membuat spreadsheet Excel', 'error');
    }
  };

  const handleExportCSV = () => {
    if (rekapData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToCSV(rekapData, stats, { gedung, bulan });
      showToast('File data CSV berhasil diunduh (.csv)', 'success');
    } catch (err: any) {
      console.error('CSV export error:', err);
      showToast('Gagal membuat file CSV', 'error');
    }
  };

  const maxHours = Math.max(1, ...rekapData.map(d => d.jamOkupansi), 20);

  return (
    <div className="p-8 relative min-h-screen pb-24">
      {/* Toast Notification */}
      {toast.type && (
        <div 
          className={`fixed top-6 right-6 z-50 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-[#006B45]' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45] flex items-center gap-2">
            <BarChart3 className="w-7 h-7" />
            Rekap & Laporan Analytics
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Rekapitulasi okupansi reservasi dan frekuensi kerusakan fasilitas kampus (US 17)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Dropdown Filters */}
          <div className="flex gap-2 p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <select 
              value={gedung}
              onChange={(e) => setGedung(e.target.value)}
              className="text-xs font-semibold outline-none bg-transparent cursor-pointer text-gray-700 px-2 py-1"
            >
              {availableBuildings.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="w-px h-5 bg-gray-200 self-center"></div>
            <select 
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="text-xs font-semibold outline-none bg-transparent cursor-pointer text-gray-700 px-2 py-1"
            >
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Bulan Lalu">Bulan Lalu</option>
              <option value="Tahun Ini">Tahun Ini</option>
              <option value="Semua Waktu">Semua Waktu</option>
            </select>
          </div>

          <button 
            onClick={fetchRekapData}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Segarkan data dari database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#006B45]' : ''} />
            <span>Segarkan</span>
          </button>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF} 
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm text-xs cursor-pointer"
              title="Unduh dokumen resmi PDF"
            >
              <Download size={14} /> PDF
            </button>
            <button 
              onClick={handleExportExcel} 
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm text-xs cursor-pointer"
              title="Unduh spreadsheet Excel (.xlsx)"
            >
              <Download size={14} /> Excel
            </button>
            <button 
              onClick={handleExportCSV} 
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm text-xs cursor-pointer"
              title="Unduh data CSV (.csv)"
            >
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Jam Terpakai</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.totalJam} Jam</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#006B45]/10 text-[#006B45] rounded-full flex items-center justify-center shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rata-rata Okupansi</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.rataOkupansi} Jam</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Insiden</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.totalInsiden}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fasilitas Terdampak</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.fasilitasTerdampak}</p>
          </div>
        </div>
      </div>

      {/* Main Two Columns: Okupansi Bars & Daftar Kerusakan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Okupansi Fasilitas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#006B45]/10 text-[#006B45] rounded-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Okupansi Fasilitas (Jam)</h2>
                <p className="text-xs text-gray-500">Akumulasi jam penggunaan reservasi dari database</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {bulan}
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Loader2 size={28} className="animate-spin text-[#006B45]" />
              <p className="text-xs">Menghitung okupansi dari data reservasi...</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {rekapData.map((d) => {
                const percent = Math.min(100, Math.max(6, Math.round((d.jamOkupansi / maxHours) * 100)));
                return (
                  <div key={d.id} className="p-2 rounded-lg hover:bg-gray-50/70 transition-colors">
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{d.fasilitas}</span>
                        <span className="text-xs text-gray-400 font-mono">({d.gedung})</span>
                      </div>
                      <span className="text-xs font-bold text-[#006B45] bg-[#006B45]/10 px-2 py-0.5 rounded">
                        {d.jamOkupansi} Jam
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#006B45] to-[#0D7C55] h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {rekapData.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada data fasilitas yang sesuai dengan filter gedung.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Column: Daftar Kerusakan Fasilitas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Daftar Kerusakan & Kondisi</h2>
                <p className="text-xs text-gray-500">Frekuensi insiden kerusakan fasilitas dari tabel laporan</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
              {stats.totalInsiden} Laporan
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Loader2 size={28} className="animate-spin text-orange-600" />
              <p className="text-xs">Memuat rekap kerusakan dari database...</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {rekapData.map((d) => (
                <div 
                  key={d.id} 
                  className={`flex justify-between items-center p-3.5 border rounded-lg transition-colors ${
                    d.jumlahKerusakan > 0 
                      ? 'border-orange-200 bg-orange-50/20 hover:bg-orange-50/40' 
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      d.jumlahKerusakan > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                    }`}>
                      {d.jumlahKerusakan}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{d.fasilitas}</p>
                      <p className="text-xs text-gray-500">{d.gedung} {d.floor ? `• Lt. ${d.floor}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      d.status === 'Sangat Baik' ? 'bg-green-100 text-green-700 border-green-200' :
                      d.status === 'Perlu Perbaikan' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
              {rekapData.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada data untuk filter yang dipilih.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
