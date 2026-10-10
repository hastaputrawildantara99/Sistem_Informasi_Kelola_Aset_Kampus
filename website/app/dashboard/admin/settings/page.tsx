"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "system">("profile");

  // State untuk Feedback & Loading
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State Profile
  const [profile, setProfile] = useState({
    name: "Djuan Setyo Jati",
    email: "admin@kampus.ac.id",
    username: "admin",
    nip: "",
    role: "Administrator Utama SIKAK",
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
    opHoursEnd: "20:00",
    maintenanceMode: false,
    maxReservationDays: 14,
  });

  // Fetch admin profile from Database API
  const fetchProfile = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "Djuan Setyo Jati",
          email: data.email || "admin@kampus.ac.id",
          username: data.username || "admin",
          nip: data.nip || "",
          role: data.role || "Administrator Utama SIKAK",
        });
      }

      // Load preferences from localStorage if exists
      if (typeof window !== "undefined") {
        const savedNotif = localStorage.getItem("sikak_admin_notifications");
        if (savedNotif) setNotifications(JSON.parse(savedNotif));

        const savedSys = localStorage.getItem("sikak_admin_system");
        if (savedSys) setSystemConfig(JSON.parse(savedSys));
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showSuccess = (msg: string) => {
    setSavedSuccess(msg);
    setErrorMessage(null);
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSavedSuccess(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Submit Handler
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === "profile") {
        const res = await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_profile",
            name: profile.name,
            email: profile.email,
            nip: profile.nip,
          }),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Gagal memperbarui profil");
        }

        showSuccess(result.message || "Profil admin berhasil diperbarui di database!");
      } else if (activeTab === "security") {
        if (!security.currentPassword || !security.newPassword) {
          throw new Error("Harap isi kata sandi saat ini dan kata sandi baru");
        }

        if (security.newPassword !== security.confirmPassword) {
          throw new Error("Konfirmasi kata sandi baru tidak cocok");
        }

        if (security.newPassword.length < 6) {
          throw new Error("Kata sandi baru minimal 6 karakter");
        }

        const res = await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "change_password",
            currentPassword: security.currentPassword,
            newPassword: security.newPassword,
            confirmPassword: security.confirmPassword,
          }),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Gagal memperbarui kata sandi");
        }

        setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showSuccess(result.message || "Kata sandi admin berhasil diperbarui di database!");
      } else if (activeTab === "notifications") {
        if (typeof window !== "undefined") {
          localStorage.setItem("sikak_admin_notifications", JSON.stringify(notifications));
        }
        await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "preferences" }),
        });
        showSuccess("Preferensi notifikasi sistem berhasil disimpan!");
      } else if (activeTab === "system") {
        if (typeof window !== "undefined") {
          localStorage.setItem("sikak_admin_system", JSON.stringify(systemConfig));
        }
        await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "preferences" }),
        });
        showSuccess("Pengaturan konfigurasi operasional sistem berhasil disimpan!");
      }
    } catch (err: any) {
      showError(err.message || "Terjadi kesalahan saat menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Pengaturan Akun & Sistem
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola profil admin di database, keamanan kata sandi, dan preferensi operasional sistem SIKAK.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium animate-fade-in shadow-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{savedSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-sm font-medium animate-fade-in shadow-sm">
              <AlertCircle size={18} className="text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={fetchProfile}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Muat ulang data dari database"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin text-[#006B45]" : ""} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab("profile"); setErrorMessage(null); }}
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
          type="button"
          onClick={() => { setActiveTab("security"); setErrorMessage(null); }}
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
          type="button"
          onClick={() => { setActiveTab("notifications"); setErrorMessage(null); }}
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
          type="button"
          onClick={() => { setActiveTab("system"); setErrorMessage(null); }}
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
        {isFetching ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader2 size={32} className="animate-spin text-[#006B45]" />
            <p className="text-sm font-medium">Memuat data akun admin dari database...</p>
          </div>
        ) : (
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
                      <Sparkles size={12} /> Super Admin Terverifikasi
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm bg-gray-50 cursor-not-allowed text-gray-600"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Username sistem bersifat unik dan permanen di database.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIP / Nomor Identitas Pegawai
                    </label>
                    <input
                      type="text"
                      value={profile.nip}
                      onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                      placeholder="Masukkan NIP atau ID Petugas"
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
                    Ubah kata sandi akun administrator di database dengan memverifikasi kata sandi saat ini terlebih dahulu.
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
                        required
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
                        placeholder="Minimal 6 karakter"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006B45] focus:border-transparent text-sm"
                        required
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
                        required
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
                      <p className="text-xs text-gray-500">Kirim pemberitahuan saat ada calon pengguna yang mengajukan registrasi akun.</p>
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
                      <p className="text-xs text-gray-500">Siapkan ringkasan okupansi bulanan otomatis dalam format PDF/Excel.</p>
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
                className="flex items-center gap-2 bg-[#006B45] hover:bg-[#005234] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{loading ? "Menyimpan ke Database..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
