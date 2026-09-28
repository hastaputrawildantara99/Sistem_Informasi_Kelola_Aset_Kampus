'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

type Facility = {
  id: number;
  name: string;
  code: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'RUANGAN' | 'LABORATORIUM' | 'AUDITORIUM' | 'AULA';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
};

const initialFacilities: Facility[] = [
  { id: 1, name: 'Lab RPL', code: 'LAB-01', building: 'Gedung A', floor: '1', capacity: 30, type: 'LABORATORIUM', status: 'ACTIVE' },
  { id: 2, name: 'Smart Class C.201', code: 'R-C201', building: 'Gedung C', floor: '2', capacity: 40, type: 'RUANGAN', status: 'ACTIVE' },
  { id: 3, name: 'Auditorium Rektorat', code: 'AUD-01', building: 'Rektorat', floor: '3', capacity: 500, type: 'AUDITORIUM', status: 'ACTIVE' },
  { id: 4, name: 'Lab Komputer E', code: 'LAB-02', building: 'Gedung E', floor: '1', capacity: 25, type: 'LABORATORIUM', status: 'MAINTENANCE' },
  { id: 5, name: 'Aula Fakultas', code: 'AUL-01', building: 'Gedung F', floor: '2', capacity: 200, type: 'AULA', status: 'INACTIVE' },
  { id: 6, name: 'Ruang Seminar 1', code: 'R-S01', building: 'Gedung B', floor: '1', capacity: 50, type: 'RUANGAN', status: 'ACTIVE' },
  { id: 7, name: 'Lab Jaringan', code: 'LAB-03', building: 'Gedung A', floor: '2', capacity: 20, type: 'LABORATORIUM', status: 'ACTIVE' },
  { id: 8, name: 'Ruang Rapat Utama', code: 'R-R01', building: 'Rektorat', floor: '2', capacity: 30, type: 'RUANGAN', status: 'ACTIVE' },
  { id: 9, name: 'Lab Hardware', code: 'LAB-04', building: 'Gedung C', floor: '1', capacity: 25, type: 'LABORATORIUM', status: 'MAINTENANCE' },
  { id: 10, name: 'Kelas B.102', code: 'R-B102', building: 'Gedung B', floor: '1', capacity: 45, type: 'RUANGAN', status: 'ACTIVE' },
];

export default function FasilitasPage() {
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [currentFacility, setCurrentFacility] = useState<Partial<Facility>>({});
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<number | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Computed values
  const filteredFacilities = facilities.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fac.code.toLowerCase().includes(searchTerm.toLowerCase());
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
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setCurrentFacility({
      type: 'RUANGAN',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (facility: Facility) => {
    setModalMode('EDIT');
    setCurrentFacility(facility);
    setIsModalOpen(true);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'CREATE') {
      const newFacility = {
        ...currentFacility,
        id: Date.now(),
      } as Facility;
      setFacilities([...facilities, newFacility]);
      showToast('Fasilitas berhasil ditambahkan');
    } else {
      setFacilities(facilities.map(f => f.id === currentFacility.id ? currentFacility as Facility : f));
      showToast('Fasilitas berhasil diperbarui');
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = (id: number) => {
    setFacilityToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (facilityToDelete !== null) {
      setFacilities(facilities.filter(f => f.id !== facilityToDelete));
      showToast('Fasilitas berhasil dihapus');
    }
    setIsDeleteModalOpen(false);
    setFacilityToDelete(null);
  };

  const toggleStatus = (id: number) => {
    setFacilities(facilities.map(f => {
      if (f.id === id) {
        let newStatus = f.status;
        if (f.status === 'ACTIVE') newStatus = 'INACTIVE';
        else if (f.status === 'INACTIVE') newStatus = 'ACTIVE';
        return { ...f, status: newStatus as any };
      }
      return f;
    }));
    showToast('Status fasilitas diperbarui');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RUANGAN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LABORATORIUM': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'AUDITORIUM': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'AULA': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      {toastMessage && (
        <div className="fixed top-8 right-8 z-50 bg-[#006B45] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check size={20} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#006B45] flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Kelola Fasilitas Master
          </h1>
          <p className="text-gray-600 mt-1">Manajemen data fasilitas kampus</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#006B45] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0D7C55] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Tambah Fasilitas
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Fasilitas</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Aktif</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Nonaktif</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.maintenance}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau kode fasilitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45] text-gray-700 bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-16">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Fasilitas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Gedung / Lantai</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kapasitas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tipe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFacilities.length > 0 ? (
                filteredFacilities.map((fac, idx) => (
                  <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{fac.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">{fac.code}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{fac.building} <span className="text-gray-400 mx-1">•</span> Lt. {fac.floor}</td>
                    <td className="px-6 py-4 text-gray-600">{fac.capacity} orang</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(fac.type)}`}>
                        {fac.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fac.status)}`}>
                        {fac.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => toggleStatus(fac.id)}
                          className="p-2 text-gray-400 hover:text-[#006B45] transition-colors tooltip"
                          title="Toggle Status"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(fac)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteConfirm(fac.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada fasilitas yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-500">
          Menampilkan {filteredFacilities.length} fasilitas
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'CREATE' ? 'Tambah Fasilitas' : 'Edit Fasilitas'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="facilityForm" onSubmit={handleSaveFacility} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Nama Fasilitas</label>
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
                    <label className="text-sm font-medium text-gray-700 block">Kode Fasilitas</label>
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
                    <label className="text-sm font-medium text-gray-700 block">Gedung</label>
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
                    <label className="text-sm font-medium text-gray-700 block">Lantai</label>
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
                    <label className="text-sm font-medium text-gray-700 block">Kapasitas</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={currentFacility.capacity || ''}
                      onChange={(e) => setCurrentFacility({...currentFacility, capacity: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B45]/20 focus:border-[#006B45]"
                      placeholder="Contoh: 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Tipe Fasilitas</label>
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
                    <label className="text-sm font-medium text-gray-700 block">Status</label>
                    <div className="flex gap-4">
                      {['ACTIVE', 'INACTIVE', 'MAINTENANCE'].map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            value={status}
                            checked={currentFacility.status === status}
                            onChange={(e) => setCurrentFacility({...currentFacility, status: e.target.value as any})}
                            className="text-[#006B45] focus:ring-[#006B45]"
                          />
                          <span className={`text-sm ${getStatusColor(status).replace('bg-', 'bg-opacity-0 text-').split(' ')[1]}`}>
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="facilityForm"
                className="px-4 py-2 rounded-lg bg-[#006B45] text-white hover:bg-[#0D7C55] transition-colors font-medium flex items-center gap-2"
              >
                {modalMode === 'CREATE' ? <Plus size={18} /> : <Check size={18} />}
                {modalMode === 'CREATE' ? 'Simpan' : 'Perbarui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 p-6">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus fasilitas <span className="font-semibold text-gray-800">{facilities.find(f => f.id === facilityToDelete)?.name}</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
