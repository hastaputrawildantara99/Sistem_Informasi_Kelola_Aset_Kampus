"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  Monitor,
  Snowflake,
  Zap,
  Armchair,
  HelpCircle,
  Eye,
  Trash2,
  Info,
  Send,
  Loader2,
  UploadCloud,
} from "lucide-react";
import DashboardNavbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

type Facility = {
  id: number;
  name: string;
  code: string;
  building: string;
  floor: string;
  location: string;
  capacity: number;
  status: string;
  description?: string | null;
};

export default function FormulirLaporanBaruPage() {
  const router = useRouter();

  // State user login & fasilitas dari database
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  // State form laporan
  const [selectedKategori, setSelectedKategori] = useState<string>("proyektor");
  const [deskripsi, setDeskripsi] = useState<string>(
    "Lampu indikator proyektor gantung berkedip warna merah terus-menerus dan tidak dapat menampilkan proyeksi dari laptop dosen (No Signal). Suhu bodi proyektor terasa sangat panas setelah 10 menit dinyalakan."
  );

  // State upload foto
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // State loading & error
  const [loadingFacilities, setLoadingFacilities] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 1. Fetch Sesi User Login
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil sesi user:", err);
      }
    }
    fetchUserSession();
  }, []);

  // 2. Fetch data fasilitas dari API (/api/facilities)
  useEffect(() => {
    async function fetchFacilities() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) {
          const data = await res.json();
          const list: Facility[] = data.facilities || [];
          setFacilities(list);

          if (list.length > 0) {
            setSelectedFacilityId(list[0].id);
          }
        } else {
          setErrorMsg("Gagal mengambil data fasilitas dari server");
        }
      } catch (err) {
        console.error("GET FACILITIES ERROR:", err);
        setErrorMsg("Gagal terhubung ke server fasilitas");
      } finally {
        setLoadingFacilities(false);
      }
    }

    fetchFacilities();
  }, []);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  // Handle pilih file foto dari komputer
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5MB!");
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  }

  // Handle hapus foto yang sudah dipilih
  function handleRemoveFile() {
    setSelectedFile(null);
    setFilePreview(null);
  }

  // 3. Submit Laporan Kerusakan (POST /api/reports)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFacilityId) {
      setErrorMsg("Silakan pilih fasilitas / ruangan terlebih dahulu");
      return;
    }

    if (!deskripsi.trim()) {
      setErrorMsg("Deskripsi masalah wajib diisi");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facilityId: selectedFacilityId,
          category: selectedKategori,
          description: deskripsi,
          photoUrl: selectedFile ? `/uploads/${selectedFile.name}` : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Gagal mengirim laporan");
        setSubmitting(false);
        return;
      }

      // Redirect ke Halaman Laporan Saya setelah sukses
      router.push("/laporan/saya");
    } catch (err) {
      console.error("SUBMIT REPORT ERROR:", err);
      setErrorMsg("Terjadi kesalahan koneksi server saat mengirim laporan");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between">
      <div>
        {/* ================= NAVBAR DASHBOARD (Dinamis User Sesi) ================= */}
        <DashboardNavbar user={currentUser} />

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6">
          {/* Breadcrumb & Header Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <Link href="/laporan" className="hover:underline">
                Laporan
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/laporan" className="hover:underline">
                Laporan Kerusakan
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0D7C55] font-semibold">Laporan Baru</span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-[#131B2E] font-jakarta tracking-tight">
                Formulir Pengaduan Kerusakan Fasilitas
              </h1>
              <p className="text-sm text-[#3E4942] mt-1">
                Sampaikan kendala atau kerusakan fasilitas kampus agar dapat segera ditangani oleh petugas operasional.
              </p>
            </div>
          </div>

          {/* ================= FORM CARD CONTAINER ================= */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8"
          >
            {/* 1. Pilih Fasilitas / Ruangan (Terhubung Database Admin) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#131B2E] font-jakarta uppercase tracking-wider">
                Pilih Fasilitas / Ruangan <span className="text-red-500">*</span>
              </label>

              {loadingFacilities ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-3 bg-[#F2F3FF]/70 px-4 rounded-2xl border border-slate-200">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0D7C55]" />
                  <span>Memuat data fasilitas dari database...</span>
                </div>
              ) : facilities.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs space-y-2">
                  <p className="font-bold">Belum ada fasilitas di database.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedFacilityId || ""}
                    onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
                    className="w-full bg-[#F2F3FF]/70 border border-slate-200 p-4 rounded-2xl text-xs sm:text-sm font-bold text-[#131B2E] font-jakarta focus:outline-none focus:ring-2 focus:ring-[#0D7C55] transition-all"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} — {fac.building}, {fac.floor} ({fac.location}) — Status: {fac.status}
                      </option>
                    ))}
                  </select>

                  {/* Card Detail Ruangan Terpilih */}
                  {selectedFacility && (
                    <div className="bg-[#F2F3FF]/70 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-10 rounded-xl bg-[#0D7C55] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#131B2E] font-jakarta text-sm">
                              {selectedFacility.name} — {selectedFacility.building}, {selectedFacility.floor}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${selectedFacility.status === "ACTIVE"
                              ? "bg-emerald-100 text-[#0D7C55]"
                              : "bg-amber-100 text-amber-700"
                              }`}>
                              <CheckCircle2 className="w-3 h-3" /> {selectedFacility.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#3E4942] mt-0.5">
                            Kode Aset: {selectedFacility.code} • Lokasi: {selectedFacility.location} • Kapasitas: {selectedFacility.capacity} Orang
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-[#3E4942] flex items-center gap-1.5 pl-1">
                <Info className="w-3.5 h-3.5 text-[#0D7C55]" /> Data ruangan diambil langsung secara otomatis dari Master Data Fasilitas Admin.
              </p>
            </div>

            {/* 2. Kategori Kerusakan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#131B2E] font-jakarta uppercase tracking-wider">
                  Kategori Kerusakan <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-inter">Pilih yang paling relevan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Opsi 1 */}
                <div
                  onClick={() => setSelectedKategori("proyektor")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${selectedKategori === "proyektor"
                    ? "bg-emerald-50/50 border-[#0D7C55] ring-1 ring-[#0D7C55]"
                    : "bg-[#F2F3FF]/40 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131B2E] font-jakarta flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-[#0D7C55]" /> Proyektor / AV
                    </span>
                    <input type="radio" checked={selectedKategori === "proyektor"} readOnly className="accent-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">Display & Audio</p>
                </div>

                {/* Opsi 2 */}
                <div
                  onClick={() => setSelectedKategori("ac")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${selectedKategori === "ac"
                    ? "bg-emerald-50/50 border-[#0D7C55] ring-1 ring-[#0D7C55]"
                    : "bg-[#F2F3FF]/40 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131B2E] font-jakarta flex items-center gap-1.5">
                      <Snowflake className="w-4 h-4 text-blue-500" /> AC / Pendingin
                    </span>
                    <input type="radio" checked={selectedKategori === "ac"} readOnly className="accent-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">Suhu & Ventilasi</p>
                </div>

                {/* Opsi 3 */}
                <div
                  onClick={() => setSelectedKategori("listrik")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${selectedKategori === "listrik"
                    ? "bg-emerald-50/50 border-[#0D7C55] ring-1 ring-[#0D7C55]"
                    : "bg-[#F2F3FF]/40 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131B2E] font-jakarta flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" /> Listrik & Colokan
                    </span>
                    <input type="radio" checked={selectedKategori === "listrik"} readOnly className="accent-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">Stopkontak & MCB</p>
                </div>

                {/* Opsi 4 */}
                <div
                  onClick={() => setSelectedKategori("furnitur")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${selectedKategori === "furnitur"
                    ? "bg-emerald-50/50 border-[#0D7C55] ring-1 ring-[#0D7C55]"
                    : "bg-[#F2F3FF]/40 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131B2E] font-jakarta flex items-center gap-1.5">
                      <Armchair className="w-4 h-4 text-emerald-600" /> Furnitur / Meja
                    </span>
                    <input type="radio" checked={selectedKategori === "furnitur"} readOnly className="accent-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">Kursi, Pintu, Jendela</p>
                </div>

                {/* Opsi 5 */}
                <div
                  onClick={() => setSelectedKategori("lainnya")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 sm:col-span-2 ${selectedKategori === "lainnya"
                    ? "bg-emerald-50/50 border-[#0D7C55] ring-1 ring-[#0D7C55]"
                    : "bg-[#F2F3FF]/40 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131B2E] font-jakarta flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-500" /> Kendala Lainnya
                    </span>
                    <input type="radio" checked={selectedKategori === "lainnya"} readOnly className="accent-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">Jaringan LAN, Kebersihan, Kerusakan Fisik Bangunan</p>
                </div>
              </div>
            </div>

            {/* 3. Deskripsi Masalah Detail */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#131B2E] font-jakarta uppercase tracking-wider">
                  Deskripsi Masalah Detail <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-inter">
                  {deskripsi.length} / 500 karakter
                </span>
              </div>

              <textarea
                rows={4}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-[#F2F3FF]/40 text-xs text-[#131B2E] p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D7C55] leading-relaxed resize-none font-inter"
                placeholder="Jelaskan detail kerusakan..."
                required
              />
              <p className="text-xs text-slate-500 pl-1">
                Mohon sebutkan kronologi singkat dan dampak langsung terhadap kegiatan pembelajaran di ruang tersebut.
              </p>
            </div>

            {/* 4. Upload Foto Bukti Kerusakan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#131B2E] font-jakarta uppercase tracking-wider">
                  Upload Foto Bukti Kerusakan <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Format JPG / PNG • Maks. 5MB</span>
              </div>

              <div className="bg-[#F2F3FF]/60 border border-slate-200 p-4 rounded-2xl space-y-3">
                {selectedFile ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-12 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                        {filePreview ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <span>IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#131B2E] font-jakarta truncate max-w-[220px]">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#0D7C55] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Siap Diunggah
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#0D7C55] bg-white p-6 rounded-2xl transition-all cursor-pointer text-center">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0D7C55] flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#131B2E] font-jakarta">
                          Klik untuk memilih foto kerusakan dari perangkat
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG atau JPEG (Maks. 5MB)</p>
                      </div>
                      <span className="mt-2 inline-block px-4 py-2 bg-[#0D7C55] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#006141]">
                        Pilih File Foto
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Informasi Alur & Penanganan Otomatis */}
            <div className="bg-[#F2F3FF]/70 border border-slate-200/80 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#0D7C55] text-white rounded-xl shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#131B2E] font-jakarta">Informasi Alur & Penanganan Otomatis</p>
                <p className="text-[#3E4942] leading-relaxed">
                  Laporan yang Anda kirim akan langsung memperbarui status ruangan di Sistem SIKAK dan mengirim tiket prioritas ke Bagian Sarana & Prasarana.
                </p>
              </div>
            </div>

            {/* Error Message Feedback */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-xs rounded-2xl font-inter">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <p className="text-xs text-slate-500 italic">
                Terhubung langsung ke database SIKAK
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Link
                  href="/laporan"
                  className="px-6 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors font-jakarta text-center"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={submitting || loadingFacilities || facilities.length === 0}
                  className="flex items-center justify-center gap-2 bg-[#0D7C55] hover:bg-[#006141] text-white px-6 py-3 rounded-2xl text-xs font-semibold shadow-sm transition-all font-jakarta disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
