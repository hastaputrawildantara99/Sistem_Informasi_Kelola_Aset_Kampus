'use client';

import { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, Search, Plus, UserCheck, UserX, X } from 'lucide-react';

type UserRole = 'ADMIN' | 'PETUGAS' | 'USER';

type UserData = {
  id: number;
  name: string;
  email: string;
  identityNumber: string;
  role: UserRole;
  type: string;
  verified: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const mockData: UserData[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      identityNumber: `2000${i + 1}`,
      role: i === 0 ? 'ADMIN' : i < 4 ? 'PETUGAS' : 'USER',
      type: i % 2 === 0 ? 'MAHASISWA' : 'DOSEN',
      verified: i % 5 !== 0
    }));
    setUsers(mockData);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const handleRoleChange = (id: number, newRole: UserRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    showToast(`Role berhasil diubah menjadi ${newRole}`, 'success');
  };

  const handleToggleVerified = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, verified: !u.verified } : u));
    showToast('Status verifikasi berhasil diubah', 'success');
  };

  const handleDelete = () => {
    if (showDeleteModal) {
      setUsers(users.filter(u => u.id !== showDeleteModal));
      setShowDeleteModal(null);
      showToast('Pengguna berhasil dihapus', 'success');
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserData = {
      id: Date.now(),
      name: 'Pengguna Baru',
      email: 'newuser@example.com',
      identityNumber: '3000' + Math.floor(Math.random() * 1000),
      role: 'USER',
      type: 'MAHASISWA',
      verified: true
    };
    setUsers([newUser, ...users]);
    setShowAddModal(false);
    showToast('Pengguna baru berhasil ditambahkan', 'success');
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.identityNumber.includes(search);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    petugas: users.filter(u => u.role === 'PETUGAS').length,
    user: users.filter(u => u.role === 'USER').length,
    verified: users.filter(u => u.verified).length,
    unverified: users.filter(u => !u.verified).length
  };

  return (
    <div className="p-8 relative">
      {toast.type && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Tambah Pengguna Baru</h3>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIP</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" required />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]">
                      <option value="USER">User</option>
                      <option value="PETUGAS">Petugas</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]">
                      <option value="MAHASISWA">Mahasiswa</option>
                      <option value="DOSEN">Dosen</option>
                      <option value="STAF">Staf</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-[#006B45] text-white rounded-lg font-medium hover:bg-[#0D7C55] transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45]">Manajemen Akun</h1>
          <p className="text-gray-600 mt-1">Kelola data pengguna sistem</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#006B45] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D7C55] transition-colors shadow-sm">
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Users</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Admin</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.admin}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Petugas</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.petugas}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">User</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.user}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Verified</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Unverified</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.unverified}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm w-full"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] w-full md:w-auto"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="PETUGAS">Petugas</option>
            <option value="USER">User</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pengguna</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">NIM/NIP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tipe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.identityNumber}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={`text-xs font-medium rounded-lg px-2 py-1 outline-none border-none cursor-pointer ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'PETUGAS' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="PETUGAS">PETUGAS</option>
                      <option value="USER">USER</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleVerified(user.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.verified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {user.verified ? <UserCheck size={12} /> : <UserX size={12} />}
                      {user.verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowDeleteModal(user.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Pengguna tidak ditemukan
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
