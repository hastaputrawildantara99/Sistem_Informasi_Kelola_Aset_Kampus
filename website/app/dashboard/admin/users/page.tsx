'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Trash2, 
  Search, 
  Plus, 
  UserCheck, 
  UserX, 
  X, 
  RefreshCw, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

type UserRole = 'ADMIN' | 'PETUGAS' | 'USER';

type UserData = {
  id: number;
  name: string;
  email: string;
  identityNumber: string;
  role: UserRole;
  type: string;
  verified: boolean;
  createdAt?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add User Form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    identityNumber: '',
    password: '',
    role: 'USER' as UserRole,
    type: 'MAHASISWA'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  // Fetch users from database
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Gagal mengambil data pengguna dari database');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update User Role in Database
  const handleRoleChange = async (id: number, newRole: UserRole) => {
    const previousUsers = [...users];
    // Optimistic UI update
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal memperbarui role');
      }
      showToast(`Role berhasil diubah menjadi ${newRole}`, 'success');
    } catch (err: any) {
      // Revert if error
      setUsers(previousUsers);
      showToast(err.message || 'Gagal mengubah role', 'error');
    }
  };

  // Toggle Verification status in Database
  const handleToggleVerified = async (id: number, currentVerified: boolean) => {
    const nextStatus = !currentVerified;
    const previousUsers = [...users];
    // Optimistic UI update
    setUsers(users.map(u => u.id === id ? { ...u, verified: nextStatus } : u));

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: nextStatus }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal memperbarui status verifikasi');
      }
      showToast(`Status verifikasi berhasil diubah menjadi ${nextStatus ? 'TERVERIFIKASI' : 'BELUM TERVERIFIKASI'}`, 'success');
    } catch (err: any) {
      // Revert if error
      setUsers(previousUsers);
      showToast(err.message || 'Gagal mengubah status verifikasi', 'error');
    }
  };

  // Delete User from Database
  const handleDelete = async () => {
    if (!showDeleteModal) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users/${showDeleteModal}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menghapus pengguna');
      }

      setUsers(users.filter(u => u.id !== showDeleteModal));
      setShowDeleteModal(null);
      showToast(result.message || 'Pengguna berhasil dihapus', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add User to Database
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menambahkan pengguna baru');
      }

      setUsers([result, ...users]);
      setShowAddModal(false);
      setNewUserForm({
        name: '',
        email: '',
        identityNumber: '',
        password: '',
        role: 'USER',
        type: 'MAHASISWA'
      });
      showToast('Pengguna baru berhasil ditambahkan ke database', 'success');
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat menambah pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = 
      (u.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (u.email?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (u.identityNumber?.toLowerCase() || '').includes(search.toLowerCase());
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
    <div className="p-8 relative min-h-screen">
      {/* Toast Notification */}
      {toast.type && (
        <div 
          className={`fixed top-4 right-4 max-w-md px-6 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2 transition-all z-50 ${
            toast.type === 'success' ? 'bg-[#006B45]' : 'bg-red-600'
          }`}
        >
          {toast.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
          {toast.type === 'success' && <UserCheck size={18} className="shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Hapus Akun</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun ini dari database? Pengguna yang memiliki riwayat reservasi atau laporan fasilitas tidak dapat dihapus.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(null)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={isDeleting}
                onClick={handleDelete} 
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Tambah Pengguna Baru</h3>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" 
                    placeholder="Contoh: Budi Santoso"
                    required 
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email Kampus</label>
                  <input 
                    type="email" 
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" 
                    placeholder="Contoh: budi@kampus.ac.id"
                    required 
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">NIM / NIP / Username</label>
                  <input 
                    type="text" 
                    value={newUserForm.identityNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, identityNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" 
                    placeholder="Contoh: 2108561001"
                    required 
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Password (Opsional)</label>
                  <input 
                    type="password" 
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]" 
                    placeholder="Default: password123"
                  />
                  <p className="text-xs text-gray-400 mt-1">Kosongkan jika ingin menggunakan password bawaan (*password123*)</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block font-medium text-gray-700 mb-1">Role Sistem</label>
                    <select 
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                    >
                      <option value="USER">USER</option>
                      <option value="PETUGAS">PETUGAS</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block font-medium text-gray-700 mb-1">Kategori Civitas</label>
                    <select 
                      value={newUserForm.type}
                      onChange={(e) => setNewUserForm({ ...newUserForm, type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                    >
                      <option value="MAHASISWA">Mahasiswa</option>
                      <option value="DOSEN">Dosen</option>
                      <option value="STAF">Staf</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#006B45] text-white rounded-lg font-medium text-sm hover:bg-[#0D7C55] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45]">Manajemen Akun</h1>
          <p className="text-gray-600 mt-1 text-sm">Sinkronisasi & kelola data akun pengguna di database</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchUsers} 
            disabled={isLoading}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Muat ulang data dari database"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#006B45]' : ''} />
            <span>Segarkan</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-2 bg-[#006B45] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#0D7C55] transition-colors shadow-sm"
          >
            <Plus size={18} /> Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">User</p>
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

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, NIM/NIP..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm w-full"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] w-full md:w-auto text-gray-700 font-medium cursor-pointer"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PETUGAS">PETUGAS</option>
            <option value="USER">USER</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 size={32} className="animate-spin text-[#006B45]" />
              <p className="text-sm font-medium">Memuat data pengguna dari database...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Pengguna</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">NIM / NIP / Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tipe Civitas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status Akun</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {user.identityNumber || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 outline-none border border-transparent hover:border-gray-300 transition-colors cursor-pointer ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'PETUGAS' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="PETUGAS">PETUGAS</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {user.type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleVerified(user.id, user.verified)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          user.verified 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                        title="Klik untuk mengubah status verifikasi di database"
                      >
                        {user.verified ? <UserCheck size={13} /> : <UserX size={13} />}
                        {user.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setShowDeleteModal(user.id)} 
                          className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada pengguna yang cocok dengan pencarian atau filter.
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
