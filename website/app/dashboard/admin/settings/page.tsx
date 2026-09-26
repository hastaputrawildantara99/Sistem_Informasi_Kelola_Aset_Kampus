"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Bell,
  Sliders,
  KeyRound,
  Mail,
  Building,
  CheckCircle2,
  Save,
  Lock,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "system">("profile");

  // State untuk Feedback Simpan
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State Profile
  const [profile, setProfile] = useState({
    name: "Djuan Setyo Jati",
    email: "admin@kampus.ac.id",
    username: "admin",
    nip: "199408222019031008",
    role: "Administrator Utam SI-KAK",
  });

  // Form State Password
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form State Notification
  const [notifications, setNotifications] = useState({
    emailNewRegistration: true,
    emailDamageReport: true,
    emailReservationRequest: false,
    systemAlerts: true,
  });

  // Form State System
  const [systemConfig, setSystemConfig] = useState({
    campusName: "Universitas Udayana / Kampus Utama",
    opHoursStart: "07:00",
    opHoursEnd: "21:00",
    maintenanceMode: false,
    maxReservationDays: 14,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Pengaturan Akun & Sistem
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola identitas profil admin, keamanan kata sandi, dan preferensi operasional sistem SIKAK.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Perubahan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "border-[#006B45] text-[#006B45] bg-emerald-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <User size={18} />
          Profil Admin
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "security"
              ? "border-[#006B45] text-[#006B45] bg-emerald-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ShieldCheck size={18} />
          Keamanan & Kata Sandi
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-[#006B45] text-[#006B45] bg-emerald-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Bell size={18} />
          Notifikasi Sistem
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "system"
              ? "border-[#006B45] text-[#006B45] bg-emerald-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Sliders size={18} />
          Preferensi Sistem
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave}>
          {/* TAB 1: PROFIL ADMIN */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                <div className="h-20 w-20 rounded-full bg-[#006B45] text-white flex items-center justify-center font-bold text-2xl shadow-md border-4 border-emerald-50">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-500">{profile.role}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#006B45]">
                    <Sparkles size={12} /> Super Admin Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Resmi Kampus
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username Admin
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Username sistem bersifat unik dan permanen.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIP / Nomor Identitas Pegawai
                  </label>
                  <input
                    type="text"
                    value={profile.nip}
                    onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEAMANAN & KATA SANDI */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Pembaruan Kata Sandi</h3>
                <p className="text-sm text-gray-500">
                  Gunakan kata sandi yang kuat dengan minimal 8 karakter mencakup huruf besar, angka, dan simbol.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi saat ini"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi baru"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Ulangi kata sandi baru"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFIKASI SISTEM */}
          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Pengaturan Preferensi Email & Alerts</h3>
                <p className="text-sm text-gray-500">
                  Tentukan jenis pemberitahuan otomatis yang ingin diterima oleh admin.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Registrasi User Baru (US 16)</p>
                    <p className="text-xs text-gray-500">Kirim pemberitahuan email saat ada calon pengguna yang mendaftar.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNewRegistration}
                    onChange={(e) => setNotifications({ ...notifications, emailNewRegistration: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-[#006B45] focus:ring-[#006B45] cursor-pointer"
                  />
                </div>

                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Laporan Kerusakan Fasilitas (US 17)</p>
                    <p className="text-xs text-gray-500">Dapatkan alert instan jika ada laporan kerusakan sarana yang mendesak.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailDamageReport}
                    onChange={(e) => setNotifications({ ...notifications, emailDamageReport: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-[#006B45] focus:ring-[#006B45] cursor-pointer"
                  />
                </div>

                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Ringkasan Laporan Rekapitulasi</p>
                    <p className="text-xs text-gray-500">Kirim ringkasan okupansi bulanan otomatis dalam format PDF/Excel.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailReservationRequest}
                    onChange={(e) => setNotifications({ ...notifications, emailReservationRequest: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-[#006B45] focus:ring-[#006B45] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PREFERENSI SISTEM */}
          {activeTab === "system" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Konfigurasi Operasional SIKAK</h3>
                <p className="text-sm text-gray-500">
                  Pengaturan parameter global untuk seluruh modul reservasi dan fasilitas kampus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lembaga / Kampus
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={systemConfig.campusName}
                      onChange={(e) => setSystemConfig({ ...systemConfig, campusName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jam Buka Operasional
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="time"
                      value={systemConfig.opHoursStart}
                      onChange={(e) => setSystemConfig({ ...systemConfig, opHoursStart: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jam Tutup Operasional
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                    <input
                      type="time"
                      value={systemConfig.opHoursEnd}
                      onChange={(e) => setSystemConfig({ ...systemConfig, opHoursEnd: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 mt-4">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Mode Pemeliharaan (Maintenance Mode)</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Jika diaktifkan, pengguna umum tidak dapat melakukan pengajuan registrasi atau reservasi baru.
                  </p>
                  <label className="inline-flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemConfig.maintenanceMode}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-amber-900">Aktifkan Maintenance Mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#006B45] hover:bg-[#005234] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
