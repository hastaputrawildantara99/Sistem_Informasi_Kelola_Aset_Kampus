'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Shield, 
  CheckCircle, 
  BarChart3, 
  AlertTriangle, 
  ClipboardList, 
  TrendingUp, 
  FileText, 
  Filter, 
  ChevronDown, 
  Plus, 
  Lightbulb, 
  RefreshCw,
  X
} from 'lucide-react';

const initialVerifications = [
  { id: 1, name: 'Muhammad Farhan Pratama', email: 'm.farhanpratama@kampus.ac.id', nip: '2108561042', role: 'Mahasiswa', date: 'Hari ini, 09:15 WIB', initials: 'MF', color: 'purple' },
  { id: 2, name: 'Dr. Maya Sartika, M.T.', email: 'maya.sartika@kampus.ac.id', nip: '198403122001012001', role: 'Dosen', date: 'Hari ini, 08:30 WIB', initials: 'MS', color: 'teal' },
  { id: 3, name: 'Dimas Aditya Kusuma', email: 'dimas.aditya@student.kampus.ac.id', nip: '2208561019', role: 'Mahasiswa', date: 'Kemarin, 18:45 WIB', initials: 'DA', color: 'orange' },
  { id: 4, name: 'Siti Nurhaliza, S.Kom.', email: 'siti.nurhaliza@kampus.ac.id', nip: '199105242018032002', role: 'Staff Lab', date: 'Kemarin, 14:10 WIB', initials: 'SN', color: 'pink' }
];

const initialFacilities = [
  { id: 1, name: 'Lab Rekayasa Perangkat Lunak', details: 'Gedung B Lt. 2 • Kapasitas 45 Kursi', status: 'Aktif', color: 'emerald' },
  { id: 2, name: 'Auditorium Utama Rektorat', details: 'Gedung Rektorat Lt. 3 • Kapasitas 300 Kursi', status: 'Aktif', color: 'blue' },
  { id: 3, name: 'Smart Classroom E.201', details: 'Gedung E Lt. 2 • Maintenance Proyektor', status: 'Nonaktif', color: 'rose' }
];

export default function AdminDashboardPage() {
  const [verifications, setVerifications] = useState(initialVerifications);
  const [facilities, setFacilities] = useState(initialFacilities);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pengguna' | 'petugas'>('pengguna');
  const [formData, setFormData] = useState({ name: '', email: '', nip: '', role: 'Mahasiswa' });

  const [buildingFilter, setBuildingFilter] = useState('Semua Gedung');
  const [monthFilter, setMonthFilter] = useState('Bulan Ini (September 2026)');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id: number) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    showToast('Permohonan berhasil disetujui', 'success');
  };

  const handleReject = (id: number) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    showToast('Permohonan ditolak', 'error');
  };

  const toggleFacilityStatus = (id: number) => {
    setFacilities(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: f.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
        };
      }
      return f;
    }));
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVer = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      nip: formData.nip,
      role: formData.role,
      date: 'Baru saja',
      initials: formData.name.substring(0, 2).toUpperCase(),
      color: 'indigo'
    };
    setVerifications([newVer, ...verifications]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', nip: '', role: 'Mahasiswa' });
    showToast('Berhasil ditambahkan ke antrean', 'success');
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const content = "Laporan Rekap Data\n====================\n\nFasilitas | Okupansi (Jam) | Laporan Kerusakan | Status\nLab RPL | 75 | 2 | Aktif\nAuditorium | 55 | 3 | Aktif\nSmart Class | 50 | 12 | Nonaktif";
    downloadFile('rekap-laporan.pdf', content, 'application/pdf');
  };

  const exportExcel = () => {
    const content = "Fasilitas,Okupansi (Jam),Laporan Kerusakan,Status\nLab RPL,75,2,Aktif\nAuditorium,55,3,Aktif\nSmart Class,50,12,Nonaktif";
    downloadFile('rekap-laporan.csv', content, 'text/csv');
  };

  const exportCSV = () => {
    const content = "Fasilitas,Okupansi (Jam),Laporan Kerusakan,Status\nLab RPL,75,2,Aktif\nAuditorium,55,3,Aktif\nSmart Class,50,12,Nonaktif";
    downloadFile('rekap-laporan.csv', content, 'text/csv');
  };

  const activeFacilitiesCount = facilities.filter(f => f.status === 'Aktif').length;
  const inactiveFacilitiesCount = facilities.length - activeFacilitiesCount;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-opacity flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Tambah {modalType === 'pengguna' ? 'Pengguna' : 'Petugas'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]" placeholder="Masukkan nama..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]" placeholder="email@kampus.ac.id" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIP</label>
                <input required type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]" placeholder="Masukkan identitas..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peran / Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]">
                  <option>Mahasiswa</option>
                  <option>Dosen</option>
                  <option>Staff Lab</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#006B45] hover:bg-[#007A4D] rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 1: Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">
            Selamat datang kembali. Memantau ketersediaan, reservasi, dan verifikasi akun kampus secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4 text-gray-400" />
            <span>Sinkronisasi Terakhir: Hari ini, 09:40 WIB</span>
          </div>
          <div className="h-4 w-px bg-gray-200 mx-1"></div>
          <div className="w-8 h-8 rounded-full bg-[#006B45] text-white flex items-center justify-center font-medium text-sm">
            AD
          </div>
        </div>
      </div>

      {/* SECTION 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Total Fasilitas</h3>
            <div className="w-10 h-10 rounded-full bg-[#006B45]/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-[#006B45]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{facilities.length}</span>
              <span className="text-gray-500 text-sm">Ruangan</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {activeFacilitiesCount} Aktif
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                {inactiveFacilitiesCount} Nonaktif (Pemeliharaan)
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Verifikasi Pending</h3>
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{verifications.length}</span>
              <span className="text-gray-500 text-sm">Akun</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-rose-600 font-medium">
              {verifications.length > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  ⚠ Tindakan Diperlukan
                </>
              ) : (
                <span className="text-emerald-600">Semua telah diverifikasi</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Rata-rata Okupansi</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">84%</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                ↗5.2%
              </span>
              <span className="text-gray-500">dari minggu lalu</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Total Petugas</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">12</span>
              <span className="text-gray-500 text-sm">Staff</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              12 Staff aktif
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Antrean Verifikasi Registrasi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Antrean Verifikasi Registrasi</h2>
              <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                {verifications.length} Permohonan Baru
              </span>
            </div>
            <p className="text-sm text-gray-500">Daftar calon pengguna yang mengajukan validasi akun untuk akses fasilitas laboratorium.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setModalType('pengguna'); setIsModalOpen(true); }} 
              className="px-4 py-2 text-sm font-medium text-[#006B45] bg-white border border-[#006B45] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Pengguna
            </button>
            <button 
              onClick={() => { setModalType('petugas'); setIsModalOpen(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#006B45] hover:bg-[#007A4D] rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Petugas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Nama Lengkap & Email</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIM / NIP</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peran / Role</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verifications.length > 0 ? (
                verifications.map((v) => (
                  <tr key={v.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${v.color || 'gray'}-100 text-${v.color || 'gray'}-700 flex items-center justify-center font-semibold text-sm`}>
                          {v.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{v.name}</div>
                          <div className="text-sm text-gray-500">{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{v.nip}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        v.role === 'Mahasiswa' ? 'bg-emerald-100 text-emerald-700' :
                        v.role === 'Dosen' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {v.role}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{v.date}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending Verifikasi</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(v.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors">
                          Setujui
                        </button>
                        <button onClick={() => handleReject(v.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors">
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Tidak ada antrean verifikasi saat ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Menampilkan {verifications.length} antrean yang membutuhkan persetujuan</p>
          <Link href="/dashboard/admin/verifikasi" className="text-sm font-medium text-[#006B45] hover:text-[#007A4D] hover:underline flex items-center">
            Lihat Semua Antrean Verifikasi <span className="ml-1">→</span>
          </Link>
        </div>
      </div>

      {/* SECTION 4: Rekap Analytics Fasilitas & Kerusakan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#006B45]/10 text-[#006B45] rounded uppercase tracking-wider">Modul US 17</span>
              <h2 className="text-xl font-bold text-gray-900">Rekap Analytics Fasilitas & Kerusakan</h2>
            </div>
            <p className="text-sm text-gray-500">Visualisasi perbandingan jam utilisasi ruang dan intensitas insiden kerusakan sarana.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={buildingFilter}
                  onChange={(e) => {
                    setBuildingFilter(e.target.value);
                    console.log('Building filter set to:', e.target.value);
                  }}
                  className="appearance-none pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]">
                  <option>Semua Gedung</option>
                  <option>Gedung A</option>
                  <option>Gedung B</option>
                </select>
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value);
                    console.log('Month filter set to:', e.target.value);
                  }}
                  className="appearance-none pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]">
                  <option>Bulan Ini (September 2026)</option>
                  <option>Agustus 2026</option>
                  <option>Juli 2026</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-gray-500 mr-1">Ekspor Rekap:</span>
              <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-md text-xs font-medium hover:bg-rose-100 transition-colors">
                <FileText className="w-3 h-3" /> PDF
              </button>
              <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors">
                <FileText className="w-3 h-3" /> Excel
              </button>
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors">
                <FileText className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Two columns side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Tingkat Okupansi / Pemakaian (Jam) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900">Tingkat Okupansi / Pemakaian (Jam)</h3>
            <span className="px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full">Bulan Berjalan</span>
          </div>
          <p className="text-sm text-gray-500 mb-8">Akumulasi jam penggunaan terkonfirmasi periode September 2026</p>
          
          {/* Bar Chart CSS */}
          <div className="relative h-64 mt-auto mb-6 flex items-end justify-between px-2 pt-6">
            {/* Y-axis labels and grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pb-8 z-0">
              <div className="flex items-center w-full">
                <span className="w-8 text-right mr-3">100</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-8 text-right mr-3">75</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-8 text-right mr-3">50</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-8 text-right mr-3">25</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-8 text-right mr-3">0</span>
                <div className="flex-1 border-t border-solid border-gray-200"></div>
              </div>
            </div>

            {/* Bars */}
            <div className="relative z-10 flex w-full justify-around items-end h-[calc(100%-2rem)] ml-10">
              <div className="flex flex-col items-center group">
                <div className="w-12 md:w-16 bg-gradient-to-t from-[#006B45] to-[#0D7C55] rounded-t-sm relative transition-all duration-300 group-hover:opacity-90" style={{ height: '75%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">75j</div>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-3 whitespace-nowrap text-center -ml-2 w-16">Lab RPL</span>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-12 md:w-16 bg-gradient-to-t from-[#006B45] to-[#0D7C55] rounded-t-sm relative transition-all duration-300 group-hover:opacity-90" style={{ height: '55%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">55j</div>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-3 whitespace-nowrap text-center -ml-2 w-16">Aud. Rek</span>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-12 md:w-16 bg-gradient-to-t from-[#006B45] to-[#0D7C55] rounded-t-sm relative transition-all duration-300 group-hover:opacity-90" style={{ height: '50%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">50j</div>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-3 whitespace-nowrap text-center -ml-2 w-16">Smart C</span>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-12 md:w-16 bg-gradient-to-t from-[#006B45] to-[#0D7C55] rounded-t-sm relative transition-all duration-300 group-hover:opacity-90" style={{ height: '30%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">30j</div>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-3 whitespace-nowrap text-center -ml-2 w-16">Lab Komp</span>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-12 md:w-16 bg-gradient-to-t from-[#006B45] to-[#0D7C55] rounded-t-sm relative transition-all duration-300 group-hover:opacity-90" style={{ height: '15%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">15j</div>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-3 whitespace-nowrap text-center -ml-2 w-16">Aula Fas</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#006B45]" />
              <span className="font-semibold text-gray-900 text-sm">Total 315 Jam Terpakai</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">Puncak: Lab Rekayasa Perangkat Lunak</span>
          </div>
        </div>

        {/* Right Column: Frekuensi Laporan Kerusakan (Kejadian) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900">Frekuensi Laporan Kerusakan (Kejadian)</h3>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full tracking-wide">27 Total Insiden</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Sebaran laporan kerusakan sarana berdasarkan lokasi kejadian</p>
          
          <div className="space-y-4 flex-1">
            {/* Item 1 */}
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-rose-700">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Smart Class C.201</h4>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    Dominan Proyektor & Kabel
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-semibold bg-rose-50 text-rose-600 rounded whitespace-nowrap">
                12 Laporan (Kritis)
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-700">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Lab Komputer E</h4>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    Dominan PC/AC & Listrik
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-semibold bg-orange-50 text-orange-600 rounded whitespace-nowrap">
                8 Laporan (Perhatian)
              </span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-yellow-700">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Auditorium Rektorat</h4>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    Sound System & Mic Wireless
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-semibold bg-yellow-50 text-yellow-600 rounded whitespace-nowrap">
                3 Laporan (Sedang)
              </span>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-700">4</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Lab RPL Gedung B</h4>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    Maintenance Rutin Berkala
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded whitespace-nowrap">
                2 Laporan (Rendah)
              </span>
            </div>
          </div>
          
          <div className="mt-5 p-3.5 bg-[#006B45]/5 border border-[#006B45]/10 rounded-lg flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#006B45] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#006B45]">Rekomendasi Sarpras:</h4>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                Prioritaskan pengadaan unit lampu cadangan proyektor untuk Smart Class C.201 sebelum Ujian Tengah Semester.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Kontrol Status Fasilitas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Kontrol Status Fasilitas</h2>
            <p className="text-sm text-gray-500">Akses cepat ketersediaan master ruangan</p>
          </div>
          <button className="px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities.map((facility) => {
            const isActive = facility.status === 'Aktif';
            return (
              <div key={facility.id} className={`border ${isActive ? 'border-gray-200 hover:border-gray-300 bg-white' : 'border-rose-200 hover:border-rose-300 bg-rose-50/30'} rounded-lg overflow-hidden flex flex-col transition-colors shadow-sm`}>
                <div className={`h-1.5 w-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} flex items-center justify-center`}>
                      {isActive ? <Building2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className={`flex items-center gap-1.5 ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'} px-2 py-1 rounded-md text-[10px] font-semibold border`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div> {facility.status}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{facility.name}</h3>
                  <p className={`text-xs ${isActive ? 'text-gray-500' : 'text-rose-600/80 font-medium'} mb-4`}>{facility.details}</p>
                  
                  <div className={`mt-auto pt-3 border-t ${isActive ? 'border-gray-100' : 'border-rose-100'} flex justify-between items-center text-xs`}>
                    <button className="font-medium text-gray-600 hover:text-gray-900">Edit</button>
                    <button onClick={() => toggleFacilityStatus(facility.id)} className={`font-medium ${isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
                      {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 text-center">
          <Link href="/dashboard/admin/fasilitas" className="inline-flex items-center text-sm font-medium text-[#006B45] hover:text-[#007A4D] hover:underline">
            Kelola Semua 42 Fasilitas Master <span className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
