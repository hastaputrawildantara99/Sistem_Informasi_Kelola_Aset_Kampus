'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

type Facility = {
  id: number;
  name: string;
  code: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'RUANGAN' | 'LABORATORIUM' | 'AUDITORIUM' | 'AULA';
  rawType?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  location?: string;
  description?: string | null;
};

export default function FasilitasPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [currentFacility, setCurrentFacility] = useState<Partial<Facility>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3500);
  };

  // Fetch facilities from database
  const fetchFacilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/facilities');
      if (!res.ok) {
        throw new Error('Gagal mengambil data fasilitas dari database');
      }
      const data = await res.json();
      setFacilities(data);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      showToast(err.message || 'Gagal memuat data fasilitas', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Computed values
  const filteredFacilities = facilities.filter(fac => {
    const matchesSearch = (fac.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (fac.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (fac.building?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || fac.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: facilities.length,
    active: facilities.filter(f => f.status === 'ACTIVE').length,
    inactive: facilities.filter(f => f.status === 'INACTIVE').length,
    maintenance: facilities.filter(f => f.status === 'MAINTENANCE').length,
  };

  // Handlers
  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setCurrentFacility({
      name: '',
      code: `FAC-${Date.now().toString().slice(-4)}`,
      building: 'Gedung B',
      floor: '1',
      capacity: 30,
      type: 'RUANGAN',
      status: 'ACTIVE',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (facility: Facility) => {
    setModalMode('EDIT');
    setCurrentFacility({ ...facility });
    setIsModalOpen(true);
  };

  // Create or Update Facility in Database
  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacility.name) return;

    try {
      setIsSaving(true);
      if (modalMode === 'CREATE') {
        const res = await fetch('/api/admin/facilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentFacility),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Gagal menambahkan fasilitas');
        }

        setFacilities([result.data, ...facilities]);
        showToast('Fasilitas baru berhasil disimpan ke database', 'success');
      } else {
        const res = await fetch(`/api/admin/facilities/${currentFacility.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentFacility),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Gagal memperbarui fasilitas');
        }

        setFacilities(facilities.map(f => f.id === currentFacility.id ? result.data : f));
        showToast('Data fasilitas berhasil diperbarui di database', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setFacilityToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Delete Facility from Database
  const handleDelete = async () => {
    if (facilityToDelete === null) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/facilities/${facilityToDelete}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menghapus fasilitas');
      }

      setFacilities(facilities.filter(f => f.id !== facilityToDelete));
      showToast(result.message || 'Fasilitas berhasil dihapus dari database', 'success');
      setIsDeleteModalOpen(false);
      setFacilityToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus fasilitas', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Facility Status in Database (ACTIVE <-> INACTIVE)
  const toggleStatus = async (id: number) => {
    const target = facilities.find(f => f.id === id);
    if (!target) return;

    let nextStatus: 'ACTIVE' | 'INACTIVE' = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const previous = [...facilities];

    // Optimistic UI update
    setFacilities(facilities.map(f => f.id === id ? { ...f, status: nextStatus } : f));

    try {
      const res = await fetch(`/api/admin/facilities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal mengubah status');
      }
      showToast(`Status ${target.name} diubah menjadi ${nextStatus === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}`, 'success');
    } catch (err: any) {
      setFacilities(previous);
      showToast(err.message || 'Gagal mengubah status fasilitas', 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RUANGAN':
      case 'CLASSROOM': 
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LABORATORIUM':
      case 'LABORATORY': 
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'AUDITORIUM':
      case 'HALL': 
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'AULA': 
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'INACTIVE': return 'bg-red-100 text-red-700 border-red-200';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45] flex items-center gap-2">
            <Building2 className="w-7 h-7" />
            Kelola Fasilitas Master
          </h1>
          <p className="text-gray-600 mt-1 text-sm">CRUD & Manajemen data ketersediaan fasilitas kampus di database</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchFacilities}
            disabled={isLoading}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Muat ulang data fasilitas dari database"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#006B45]' : ''} />
            <span>Segarkan</span>
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-[#006B45] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0D7C55] transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={18} />
            Tambah Fasilitas
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Fasilitas</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-green-600 text-xs font-semibold uppercase tracking-wider">Aktif</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-red-600 text-xs font-semibold uppercase tracking-wider">Nonaktif</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-yellow-600 text-xs font-semibold uppercase tracking-wider">Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.maintenance}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, kode, atau gedung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-sm text-gray-700 bg-white cursor-pointer font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (ACTIVE)</option>
              <option value="INACTIVE">Nonaktif (INACTIVE)</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 size={32} className="animate-spin text-[#006B45]" />
              <p className="text-sm font-medium">Memuat data fasilitas dari database...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-16">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Nama Fasilitas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Kode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Gedung / Lantai</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Kapasitas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tipe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredFacilities.length > 0 ? (
                  filteredFacilities.map((fac, idx) => (
                    <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{fac.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{fac.code}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {fac.building || 'Gedung B'} <span className="text-gray-400 mx-1">•</span> {fac.floor ? `Lt. ${fac.floor}` : ''}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{fac.capacity} orang</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(fac.type)}`}>
                          {fac.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(fac.status)}`}>
                          {fac.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => toggleStatus(fac.id)}
                            className="p-1.5 text-gray-400 hover:text-[#006B45] hover:bg-green-50 rounded-lg transition-colors"
                            title="Ubah Status (Aktif / Nonaktif)"
                          >
                            <RefreshCw size={17} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(fac)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Fasilitas"
                          >
                            <Pencil size={17} />
                          </button>
                          <button 
                            onClick={() => handleDeleteConfirm(fac.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Fasilitas"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                      Tidak ada fasilitas yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between items-center">
          <span>Menampilkan {filteredFacilities.length} fasilitas dari total {facilities.length} di database</span>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'CREATE' ? 'Tambah Fasilitas Baru' : 'Edit Data Fasilitas'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="facilityForm" onSubmit={handleSaveFacility} className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Nama Fasilitas</label>
                    <input 
                      type="text" 
                      required
                      value={currentFacility.name || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: Lab RPL"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Kode Fasilitas</label>
                    <input 
                      type="text" 
                      required
                      value={currentFacility.code || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, code: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: LAB-01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Gedung</label>
                    <input 
                      type="text" 
                      required
                      value={currentFacility.building || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, building: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: Gedung A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Lantai</label>
                    <input 
                      type="text" 
                      required
                      value={currentFacility.floor || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, floor: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Kapasitas (Orang)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={currentFacility.capacity || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, capacity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block">Tipe Fasilitas</label>
                    <select
                      required
                      value={currentFacility.type || 'RUANGAN'}
                      onChange={(e) => setCurrentFacility({...currentFacility, type: e.target.value as any})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] bg-white"
                    >
                      <option value="RUANGAN">RUANGAN</option>
                      <option value="LABORATORIUM">LABORATORIUM</option>
                      <option value="AUDITORIUM">AUDITORIUM</option>
                      <option value="AULA">AULA</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-medium text-gray-700 block">Status Ketersediaan</label>
                    <div className="flex gap-4">
                      {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const).map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            value={status}
                            checked={currentFacility.status === status}
                            onChange={(e) => setCurrentFacility({...currentFacility, status: e.target.value as any})}
                            className="text-[#006B45] focus:ring-[#006B45]"
                          />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-medium text-gray-700 block">Deskripsi / Fasilitas Pendukung (Opsional)</label>
                    <textarea 
                      rows={2}
                      value={currentFacility.description || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, description: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: Dilengkapi proyektor, AC, dan 30 PC..."
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="facilityForm"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-[#006B45] text-white hover:bg-[#0D7C55] transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Menyimpan...' : (modalMode === 'CREATE' ? 'Simpan Fasilitas' : 'Perbarui Fasilitas')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus fasilitas <span className="font-semibold text-gray-800">{facilities.find(f => f.id === facilityToDelete)?.name}</span> dari database? Fasilitas yang memiliki riwayat reservasi atau laporan kerusakan tidak dapat dihapus.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
