'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Filter, 
  CheckSquare, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Users
} from 'lucide-react';

type UserData = {
  id: number;
  name: string;
  email: string;
  identityNumber: string;
  type: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function VerifikasiPage() {
  const [queue, setQueue] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('Semua');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3500);
  };

  // Fetch users from database
  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Gagal mengambil data antrean verifikasi dari database');
      }
      const data = await res.json();
      
      const formatted: UserData[] = data.map((u: any) => {
        const rawType = (u.type || '').toUpperCase();
        const displayType = rawType === 'DOSEN' ? 'Dosen' : rawType === 'STAF' ? 'Staf' : 'Mahasiswa';
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          identityNumber: u.identityNumber || '-',
          type: displayType,
          date: u.createdAt 
            ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-',
          status: u.verified ? 'APPROVED' : 'PENDING',
        };
      });

      setQueue(formatted);
    } catch (err: any) {
      console.error('Error fetching verification queue:', err);
      showToast(err.message || 'Gagal memuat antrean', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Approve single user
  const handleApprove = async (id: number) => {
    try {
      setIsProcessing(id);
      const res = await fetch(`/api/admin/users/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyetujui pengguna');
      }

      setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'APPROVED' } : q));
      showToast('Pendaftaran akun berhasil disetujui di database', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui pengguna', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  // Reject / delete pending user registration
  const handleReject = async (id: number) => {
    try {
      setIsProcessing(id);
      const res = await fetch(`/api/admin/users/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menolak pengguna');
      }

      // Mark as rejected or remove from queue
      setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'REJECTED' } : q));
      showToast('Permohonan pendaftaran akun telah ditolak', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pengguna', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  // Approve all pending users
  const handleApproveAll = async () => {
    const pendingCount = queue.filter(q => q.status === 'PENDING').length;
    if (pendingCount === 0) {
      showToast('Tidak ada antrean pengguna pending', 'error');
      return;
    }

    try {
      setIsProcessingAll(true);
      const res = await fetch('/api/admin/users/verify-all', {
        method: 'POST',
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyetujui semua antrean');
      }

      setQueue(prev => prev.map(q => q.status === 'PENDING' ? { ...q, status: 'APPROVED' } : q));
      showToast(`Berhasil menyetujui ${result.count || pendingCount} akun pending di database`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui semua pengguna', 'error');
    } finally {
      setIsProcessingAll(false);
    }
  };

  const filteredQueue = queue.filter(q => {
    const matchSearch = 
      (q.name.toLowerCase() || '').includes(search.toLowerCase()) || 
      (q.identityNumber.toLowerCase() || '').includes(search.toLowerCase()) ||
      (q.email.toLowerCase() || '').includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || q.type.toUpperCase() === roleFilter;
    const matchTab = activeTab === 'Semua' ? true :
      activeTab === 'Pending' ? q.status === 'PENDING' :
      activeTab === 'Disetujui' ? q.status === 'APPROVED' : q.status === 'REJECTED';
    return matchSearch && matchRole && matchTab;
  });

  const stats = {
    pending: queue.filter(q => q.status === 'PENDING').length,
    approved: queue.filter(q => q.status === 'APPROVED').length,
    total: queue.length,
  };

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45]">Antrean Verifikasi Registrasi</h1>
          <p className="text-gray-600 mt-1 text-sm">Sinkronisasi & validasi pendaftaran pengguna baru di database</p>
        </div>
        <button 
          onClick={fetchQueue}
          disabled={isLoading}
          className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          title="Muat ulang data dari database"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#006B45]' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Pending</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
            P
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Terverifikasi</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Pengguna Terdaftar</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            {['Semua', 'Pending', 'Disetujui'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-xs rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-[#006B45] text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, NIM/NIP..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm w-full"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-gray-700 bg-white font-medium cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
              <option value="STAF">Staf</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-xs text-gray-500">
            {stats.pending} permohonan sedang menunggu validasi
          </span>
          <button 
            onClick={handleApproveAll} 
            disabled={isProcessingAll || stats.pending === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessingAll ? <Loader2 size={15} className="animate-spin" /> : <CheckSquare size={15} />}
            <span>{isProcessingAll ? 'Memproses...' : 'Setujui Semua Pending'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 size={32} className="animate-spin text-[#006B45]" />
              <p className="text-sm font-medium">Memuat antrean verifikasi dari database...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Pengguna</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">NIM / NIP / Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tipe Civitas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                          item.type === 'Mahasiswa' ? 'bg-blue-600' : item.type === 'Dosen' ? 'bg-purple-600' : 'bg-orange-600'
                        }`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{item.identityNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.type === 'Mahasiswa' ? 'bg-blue-100 text-blue-700' : item.type === 'Dosen' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'PENDING' ? 'PENDING' : item.status === 'APPROVED' ? 'TERVERIFIKASI' : 'DITOLAK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {item.status === 'PENDING' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(item.id)} 
                              disabled={isProcessing === item.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isProcessing === item.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                              <span>Setujui</span>
                            </button>
                            <button 
                              onClick={() => handleReject(item.id)} 
                              disabled={isProcessing === item.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isProcessing === item.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Selesai diproses</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      Tidak ada antrean pendaftaran yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
