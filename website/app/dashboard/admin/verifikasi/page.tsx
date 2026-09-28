'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Filter, CheckSquare } from 'lucide-react';

type UserData = {
  id: number;
  name: string;
  identityNumber: string;
  type: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function VerifikasiPage() {
  const [queue, setQueue] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('Semua');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  useEffect(() => {
    const roles = ['Mahasiswa', 'Dosen', 'Staf'];
    const mockData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      identityNumber: `1000${i + 1}`,
      type: roles[i % 3],
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED'
    }));
    setQueue(mockData);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const handleApprove = (id: number) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: 'APPROVED' } : q));
    showToast('Pengguna disetujui', 'success');
  };

  const handleReject = (id: number) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: 'REJECTED' } : q));
    showToast('Pengguna ditolak', 'error');
  };

  const handleApproveAll = () => {
    setQueue(queue.map(q => q.status === 'PENDING' ? { ...q, status: 'APPROVED' } : q));
    showToast('Semua pengguna pending disetujui', 'success');
  };

  const filteredQueue = queue.filter(q => {
    const matchSearch = q.name.toLowerCase().includes(search.toLowerCase()) || q.identityNumber.includes(search);
    const matchRole = roleFilter === 'ALL' || q.type.toUpperCase() === roleFilter;
    const matchTab = activeTab === 'Semua' ? true :
      activeTab === 'Pending' ? q.status === 'PENDING' :
      activeTab === 'Disetujui' ? q.status === 'APPROVED' : q.status === 'REJECTED';
    return matchSearch && matchRole && matchTab;
  });

  const stats = {
    pending: queue.filter(q => q.status === 'PENDING').length,
    approved: queue.filter(q => q.status === 'APPROVED').length,
    rejected: queue.filter(q => q.status === 'REJECTED').length
  };

  return (
    <div className="p-8 relative">
      {toast.type && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45]">Antrean Verifikasi Registrasi</h1>
          <p className="text-gray-600 mt-1">Verifikasi pendaftaran pengguna baru</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pending</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <span className="font-bold text-xl">P</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Disetujui Hari Ini</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ditolak Hari Ini</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            {['Semua', 'Pending', 'Disetujui', 'Ditolak'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === tab ? 'bg-[#006B45] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau NIM/NIP..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm w-full md:w-64"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
              <option value="STAF">Staf</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <button onClick={handleApproveAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <CheckSquare size={16} />
            Setujui Semua Pending
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pengguna</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">NIM / NIP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tipe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal Daftar</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${item.type === 'Mahasiswa' ? 'bg-blue-500' : item.type === 'Dosen' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.identityNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.type === 'Mahasiswa' ? 'bg-blue-100 text-blue-700' : item.type === 'Dosen' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm">
                            <CheckCircle size={14} /> Setujui
                          </button>
                          <button onClick={() => handleReject(item.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm">
                            <XCircle size={14} /> Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada antrean verifikasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
