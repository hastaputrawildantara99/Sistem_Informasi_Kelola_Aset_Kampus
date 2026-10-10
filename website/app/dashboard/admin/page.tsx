'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import { 
  exportRekapToPDF, 
  exportRekapToExcel, 
  exportRekapToCSV, 
  RekapExportItem, 
  ExportStats 
} from '@/lib/exportHelper';

type VerificationItem = {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
  date: string;
  initials: string;
  color: string;
};

type FacilityItem = {
  id: number;
  name: string;
  details: string;
  status: 'Aktif' | 'Nonaktif';
  rawStatus: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  color: string;
};

type StatsData = {
  totalFacilities: number;
  activeFacilities: number;
  inactiveFacilities: number;
  pendingVerifications: number;
  totalStaff: number;
  activeStaff: number;
  totalHours: number;
  totalReports: number;
  averageOccupancy: number;
  occupancyData: Array<{
    id: number;
    name: string;
    code: string;
    building: string;
    hours: number;
    reportCount: number;
    status: string;
  }>;
  incidentData: Array<{
    id: number;
    name: string;
    code: string;
    building: string;
    reportCount: number;
    latestCategory: string;
  }>;
};

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [stats, setStats] = useState<StatsData>({
    totalFacilities: 0,
    activeFacilities: 0,
    inactiveFacilities: 0,
    pendingVerifications: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalHours: 0,
    totalReports: 0,
    averageOccupancy: 0,
    occupancyData: [],
    incidentData: [],
  });

  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pengguna' | 'petugas'>('pengguna');
  const [formData, setFormData] = useState({ name: '', email: '', nip: '', role: 'Mahasiswa' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [buildingFilter, setBuildingFilter] = useState('Semua Gedung');
  const [monthFilter, setMonthFilter] = useState('Bulan Ini');
  const [availableBuildings, setAvailableBuildings] = useState<string[]>(['Semua Gedung']);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Dashboard data from Database APIs
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const query = new URLSearchParams();
      if (buildingFilter && buildingFilter !== 'Semua Gedung') query.append('gedung', buildingFilter);
      if (monthFilter) query.append('bulan', monthFilter);

      const [statsRes, usersRes, facilitiesRes] = await Promise.all([
        fetch(`/api/admin/stats?${query.toString()}`),
        fetch('/api/admin/users'),
        fetch('/api/admin/facilities')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        if (statsData.buildings && statsData.buildings.length > 0) {
          setAvailableBuildings(statsData.buildings);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Filter pending / unverified users
        const pending = usersData
          .filter((u: any) => !u.verified)
          .map((u: any) => {
            const rawRole = u.type || (u.role === 'PETUGAS' ? 'Petugas' : 'Mahasiswa');
            const roleName = rawRole === 'MAHASISWA' ? 'Mahasiswa' : rawRole === 'DOSEN' ? 'Dosen' : rawRole === 'STAF' ? 'Staff' : rawRole;
            const initials = u.name
              ? u.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
              : 'US';
            const colors = ['purple', 'teal', 'orange', 'blue', 'pink'];
            const color = colors[u.id % colors.length];

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              nip: u.identityNumber || '-',
              role: roleName,
              date: u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja',
              initials,
              color,
            };
          });
        setVerifications(pending);
      }

      if (facilitiesRes.ok) {
        const facData = await facilitiesRes.json();
        const mappedFacilities: FacilityItem[] = facData.map((f: any) => {
          const isActive = f.status === 'ACTIVE';
          return {
            id: f.id,
            name: f.name,
            details: `${f.building || 'Gedung B'} ${f.floor ? `• ${f.floor}` : ''} • Kapasitas ${f.capacity || 30} Kursi`,
            status: isActive ? 'Aktif' : 'Nonaktif',
            rawStatus: f.status,
            color: isActive ? 'emerald' : 'rose',
          };
        });
        setFacilities(mappedFacilities);
      }

      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      showToast('Gagal memuat data dari database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [monthFilter, buildingFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Approve User in Database
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyetujui akun');
      }

      setVerifications(prev => prev.filter(v => v.id !== id));
      setStats(prev => ({
        ...prev,
        pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
      }));
      showToast('Permohonan pendaftaran berhasil disetujui', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui akun', 'error');
    }
  };

  // Reject / Delete Pending User in Database
  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menolak permohonan');
      }

      setVerifications(prev => prev.filter(v => v.id !== id));
      setStats(prev => ({
        ...prev,
        pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
      }));
      showToast('Permohonan berhasil ditolak', 'error');
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak permohonan', 'error');
    }
  };

  // Toggle Facility Status in Database (ACTIVE <-> INACTIVE)
  const toggleFacilityStatus = async (id: number, currentStatus: 'Aktif' | 'Nonaktif') => {
    const nextStatus = currentStatus === 'Aktif' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/facilities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui status fasilitas');
      }

      setFacilities(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: nextStatus === 'ACTIVE' ? 'Aktif' : 'Nonaktif',
            rawStatus: nextStatus,
          };
        }
        return f;
      }));

      // Update counters
      setStats(prev => {
        const delta = nextStatus === 'ACTIVE' ? 1 : -1;
        return {
          ...prev,
          activeFacilities: Math.max(0, prev.activeFacilities + delta),
          inactiveFacilities: Math.max(0, prev.inactiveFacilities - delta),
        };
      });

      showToast(`Status fasilitas berhasil diubah menjadi ${nextStatus === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui status fasilitas', 'error');
    }
  };

  // Add User / Staff directly to Database
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const isPetugas = modalType === 'petugas';
      const role = isPetugas ? 'PETUGAS' : 'USER';
      const type = isPetugas ? 'STAF' : (formData.role.toUpperCase() === 'DOSEN' ? 'DOSEN' : 'MAHASISWA');

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          identityNumber: formData.nip,
          role,
          type,
          password: 'password123',
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menambahkan data');
      }

      setIsModalOpen(false);
      setFormData({ name: '', email: '', nip: '', role: 'Mahasiswa' });
      showToast(`${isPetugas ? 'Petugas' : 'Pengguna'} baru berhasil ditambahkan ke database`, 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat menambah data', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

  // Filtered Occupancy & Incidents data based on current filter
  const filteredOccupancy = stats.occupancyData.filter(d => 
    buildingFilter === 'Semua Gedung' || d.building === buildingFilter
  );

  const filteredIncidents = stats.incidentData.filter(d =>
    buildingFilter === 'Semua Gedung' || d.building === buildingFilter
  );

  const currentTotalHours = filteredOccupancy.reduce((acc, curr) => acc + curr.hours, 0);
  const currentTotalReports = filteredIncidents.reduce((acc, curr) => acc + curr.reportCount, 0);

  const sortedOccupancy = [...filteredOccupancy].sort((a, b) => b.hours - a.hours);
  const topFacility = sortedOccupancy.length > 0 && sortedOccupancy[0].hours > 0 ? sortedOccupancy[0] : null;

  const maxHours = Math.max(1, ...filteredOccupancy.map(d => d.hours), 10);

  const getExportData = () => {
    const items: RekapExportItem[] = filteredOccupancy.map((f) => ({
      id: f.id,
      fasilitas: f.name,
      code: f.code || `FAC-${f.id}`,
      gedung: f.building,
      floor: '1',
      jamOkupansi: f.hours,
      jumlahKerusakan: f.reportCount,
      status: f.status === 'MAINTENANCE' ? 'Perlu Perbaikan' : (f.reportCount === 0 ? 'Sangat Baik' : 'Baik'),
    }));
    const exportStats: ExportStats = {
      totalJam: currentTotalHours,
      rataOkupansi: filteredOccupancy.length > 0 ? Math.round(currentTotalHours / filteredOccupancy.length) : 0,
      totalInsiden: currentTotalReports,
      fasilitasTerdampak: filteredIncidents.filter(i => i.reportCount > 0).length,
    };
    return { items, exportStats, filters: { gedung: buildingFilter, bulan: monthFilter } };
  };

  const exportPDF = () => {
    const { items, exportStats, filters } = getExportData();
    if (items.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToPDF(items, exportStats, filters);
      showToast('Laporan PDF resmi berhasil diunduh (.pdf)', 'success');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('Gagal membuat dokumen PDF', 'error');
    }
  };

  const exportExcel = () => {
    const { items, exportStats, filters } = getExportData();
    if (items.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToExcel(items, exportStats, filters);
      showToast('File Excel resmi berhasil diunduh (.xlsx)', 'success');
    } catch (err: any) {
      console.error('Excel export error:', err);
      showToast('Gagal membuat spreadsheet Excel', 'error');
    }
  };

  const exportCSV = () => {
    const { items, exportStats, filters } = getExportData();
    if (items.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    try {
      exportRekapToCSV(items, exportStats, filters);
      showToast('File data CSV berhasil diunduh (.csv)', 'success');
    } catch (err: any) {
      console.error('CSV export error:', err);
      showToast('Gagal membuat file CSV', 'error');
    }
  };

  const activeFacilitiesCount = stats.activeFacilities;
  const inactiveFacilitiesCount = stats.inactiveFacilities;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-xl text-white font-medium z-50 transition-opacity flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#006B45]' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Tambah Pengguna / Petugas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Tambah {modalType === 'pengguna' ? 'Pengguna' : 'Petugas'} Baru
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
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIP / Username</label>
                <input required type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]" placeholder="Masukkan nomor identitas..." />
              </div>
              {modalType === 'pengguna' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peran Civitas</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]">
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Dosen">Dosen</option>
                    <option value="Staff Lab">Staff Lab</option>
                  </select>
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#006B45] hover:bg-[#0D7C55] rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
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
          <button 
            onClick={fetchDashboardData} 
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#006B45] transition-colors disabled:opacity-50"
            title="Klik untuk menyinkronkan data database"
          >
            <RefreshCw className={`w-4 h-4 text-[#006B45] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkronisasi Terakhir: {lastSyncTime || 'Sedang memuat...'}</span>
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1"></div>
          <div className="w-8 h-8 rounded-full bg-[#006B45] text-white flex items-center justify-center font-medium text-sm">
            AD
          </div>
        </div>
      </div>

      {/* SECTION 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Fasilitas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Total Fasilitas</h3>
            <div className="w-10 h-10 rounded-full bg-[#006B45]/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-[#006B45]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{stats.totalFacilities}</span>
              <span className="text-gray-500 text-sm">Ruangan</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {activeFacilitiesCount} Aktif
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                {inactiveFacilitiesCount} Nonaktif
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Verifikasi Pending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Verifikasi Pending</h3>
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{stats.pendingVerifications}</span>
              <span className="text-gray-500 text-sm">Akun</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium">
              {stats.pendingVerifications > 0 ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Tindakan Diperlukan
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Semua telah diverifikasi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Rata-rata Okupansi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Total Jam Terpakai</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{stats.totalHours}</span>
              <span className="text-gray-500 text-sm">Jam</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Rata-rata {stats.averageOccupancy}j
              </span>
              <span className="text-gray-500">per fasilitas</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Petugas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium tracking-wide">Total Petugas</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{stats.totalStaff}</span>
              <span className="text-gray-500 text-sm">Staff</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              {stats.activeStaff} Staff aktif terdaftar
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
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#006B45]" />
              <p className="text-sm">Menyinkronkan data verifikasi dari database...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Nama Lengkap & Email</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIM / NIP / Username</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peran Civitas</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verifications.length > 0 ? (
                  verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-${v.color || 'gray'}-100 text-${v.color || 'gray'}-700 flex items-center justify-center font-semibold text-sm`}>
                            {v.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{v.name}</div>
                            <div className="text-xs text-gray-500">{v.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-mono text-gray-600">{v.nip}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                          v.role === 'Mahasiswa' ? 'bg-emerald-100 text-emerald-700' :
                          v.role === 'Dosen' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {v.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-600">{v.date}</td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending Verifikasi</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(v.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm">
                            Setujui
                          </button>
                          <button onClick={() => handleReject(v.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors shadow-sm">
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Semua pendaftaran telah diverifikasi. Tidak ada antrean pending.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Menampilkan {verifications.length} akun yang memerlukan validasi persetujuan</p>
          <Link href="/dashboard/admin/verifikasi" className="text-sm font-medium text-[#006B45] hover:text-[#007A4D] hover:underline flex items-center">
            Buka Halaman Verifikasi Akun <span className="ml-1">→</span>
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
            <p className="text-sm text-gray-500">Visualisasi jam okupansi reservasi dan intensitas laporan kerusakan sarana dari database.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  className="appearance-none pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] cursor-pointer">
                  {availableBuildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="appearance-none pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] cursor-pointer">
                  <option value="Bulan Ini">Bulan Ini (Oktober 2026)</option>
                  <option value="Bulan Lalu">Bulan Lalu (September 2026)</option>
                  <option value="Tahun Ini">Tahun Ini (2026)</option>
                  <option value="Semua Waktu">Semua Waktu</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-gray-500 mr-1">Ekspor Rekap:</span>
              <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-md text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer">
                <FileText className="w-3 h-3" /> PDF
              </button>
              <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer">
                <FileText className="w-3 h-3" /> Excel
              </button>
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer">
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
            <span className="px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full">Data Database</span>
          </div>
          <p className="text-sm text-gray-500 mb-8">Akumulasi jam penggunaan reservasi per fasilitas</p>
          
          {/* Line Chart Real Data */}
          <div className="relative h-64 mt-auto mb-6 px-2 pt-4">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pb-9 z-0 pointer-events-none">
              <div className="flex items-center w-full">
                <span className="w-7 text-right mr-3 font-mono">{maxHours}</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-7 text-right mr-3 font-mono">{Math.round(maxHours * 0.75)}</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-7 text-right mr-3 font-mono">{Math.round(maxHours * 0.5)}</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-7 text-right mr-3 font-mono">{Math.round(maxHours * 0.25)}</span>
                <div className="flex-1 border-t border-dashed border-gray-200"></div>
              </div>
              <div className="flex items-center w-full">
                <span className="w-7 text-right mr-3 font-mono">0</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            </div>

            {/* Line Chart SVG Area */}
            <div className="relative z-10 w-[calc(100%-2.5rem)] ml-10 h-[calc(100%-2.25rem)]">
              {filteredOccupancy.length > 0 ? (
                (() => {
                  const chartW = 500;
                  const chartH = 170;
                  const padX = filteredOccupancy.length > 1 ? chartW / (filteredOccupancy.length - 1) : chartW / 2;
                  
                  const points = filteredOccupancy.map((fac, idx) => {
                    const x = filteredOccupancy.length === 1 ? chartW / 2 : idx * padX;
                    const ratio = maxHours > 0 ? fac.hours / maxHours : 0;
                    const y = chartH - (ratio * (chartH - 24)) - 10;
                    return { x, y, fac };
                  });

                  const linePath = points.reduce((acc, curr, idx) => {
                    if (idx === 0) return `M ${curr.x} ${curr.y}`;
                    const prev = points[idx - 1];
                    const cx1 = prev.x + (curr.x - prev.x) / 2;
                    const cx2 = cx1;
                    return `${acc} C ${cx1} ${prev.y}, ${cx2} ${curr.y}, ${curr.x} ${curr.y}`;
                  }, '');

                  const firstP = points[0];
                  const lastP = points[points.length - 1];
                  const areaPath = `${linePath} L ${lastP.x} ${chartH} L ${firstP.x} ${chartH} Z`;

                  return (
                    <div className="relative w-full h-full flex flex-col justify-between">
                      {/* SVG Line & Gradient */}
                      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#006B45" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#006B45" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d={areaPath} fill="url(#occupancyGradient)" />
                        {/* Line */}
                        <path d={linePath} fill="none" stroke="#006B45" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      {/* Interactive Nodes */}
                      <div className="absolute inset-0 flex justify-between items-stretch pointer-events-none">
                        {points.map(({ fac, y }) => {
                          const topPercent = Math.max(0, Math.min(100, (y / chartH) * 100));
                          return (
                            <div key={fac.id} className="relative flex flex-col items-center flex-1">
                              {/* Hover Point */}
                              <div 
                                style={{ top: `${topPercent}%` }}
                                className="absolute -translate-y-1/2 pointer-events-auto group cursor-pointer"
                              >
                                <div className="w-4 h-4 rounded-full bg-white border-[3px] border-[#006B45] shadow-md group-hover:scale-125 transition-transform"></div>
                                
                                {/* Permanent or hover value badge */}
                                {fac.hours > 0 ? (
                                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#006B45] text-white text-[10px] font-bold rounded shadow-sm whitespace-nowrap">
                                    {fac.hours}j
                                  </span>
                                ) : null}

                                {/* Tooltip */}
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-30">
                                  {fac.hours} Jam ({fac.name})
                                </div>
                              </div>

                              {/* Label on X-axis */}
                              <span 
                                className="absolute bottom-[-22px] text-[11px] text-gray-600 font-semibold text-center w-full truncate px-1"
                                title={`${fac.name} (${fac.code})`}
                              >
                                {fac.code || fac.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="w-full text-center text-sm text-gray-400 py-12">
                  Tidak ada data reservasi untuk filter gedung ini.
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#006B45]" />
              <span className="font-semibold text-gray-900 text-sm">Total {currentTotalHours} Jam Terpakai</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {topFacility ? `Top: ${topFacility.name} (${topFacility.hours} Jam)` : 'Tidak ada penggunaan'}
            </span>
          </div>
        </div>

        {/* Right Column: Frekuensi Laporan Kerusakan (Kejadian) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900">Frekuensi Laporan Kerusakan</h3>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full tracking-wide">
              {currentTotalReports} Total Insiden
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Sebaran laporan kerusakan sarana fasilitas dari pengguna</p>
          
          <div className="space-y-4 flex-1">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((item, idx) => {
                const badgeColor = 
                  idx === 0 && item.reportCount > 0 ? 'bg-rose-100 text-rose-700' :
                  item.reportCount > 0 ? 'bg-orange-100 text-orange-700' :
                  'bg-emerald-100 text-emerald-700';

                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${badgeColor} flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          {item.latestCategory}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded whitespace-nowrap ${
                      item.reportCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-700'
                    }`}>
                      {item.reportCount} Laporan {item.reportCount > 0 ? '(Perlu Cek)' : '(Aman)'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Belum ada data laporan kerusakan fasilitas di database.
              </div>
            )}
          </div>
          
          <div className="mt-5 p-3.5 bg-[#006B45]/5 border border-[#006B45]/10 rounded-lg flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#006B45] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#006B45]">Rekomendasi Pemeliharaan:</h4>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                Rutin periksa fasilitas yang berstatus Maintenance dan segera koordinasikan dengan petugas untuk memastikan kenyamanan pengguna.
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
            <p className="text-sm text-gray-500">Akses cepat kontrol ketersediaan master ruangan di database</p>
          </div>
          <Link 
            href="/dashboard/admin/fasilitas" 
            className="px-3.5 py-1.5 text-sm font-medium text-[#006B45] bg-[#006B45]/5 border border-[#006B45]/20 rounded-lg hover:bg-[#006B45]/10 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Kelola Fasilitas Lengkap
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities.map((facility) => {
            const isActive = facility.status === 'Aktif';
            return (
              <div 
                key={facility.id} 
                className={`border ${
                  isActive ? 'border-gray-200 hover:border-gray-300 bg-white' : 'border-rose-200 hover:border-rose-300 bg-rose-50/30'
                } rounded-lg overflow-hidden flex flex-col transition-colors shadow-sm`}
              >
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
                    <Link href="/dashboard/admin/fasilitas" className="font-medium text-gray-600 hover:text-gray-900">
                      Detail
                    </Link>
                    <button 
                      onClick={() => toggleFacilityStatus(facility.id, facility.status)} 
                      className={`font-semibold ${isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard/admin/fasilitas" className="inline-flex items-center text-sm font-semibold text-[#006B45] hover:text-[#007A4D] hover:underline">
            Buka Halaman CRUD Master Fasilitas <span className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
