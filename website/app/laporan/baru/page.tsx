"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  Bell,
  User,
  Wrench,
  Monitor,
  Snowflake,
  Zap,
  Armchair,
  HelpCircle,
  Eye,
  Trash2,
  Info,
  Send,
  ArrowLeft
} from "lucide-react";
import DashboardNavbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

export default function FormulirLaporanBaruPage() {
  const [selectedKategori, setSelectedKategori] = useState<string>("proyektor");
  const [deskripsi, setDeskripsi] = useState<string>(
    "Lampu indikator proyektor gantung berkedip warna merah terus-menerus dan tidak dapat menampilkan proyeksi dari laptop dosen (No Signal). Suhu bodi proyektor terasa sangat panas setelah 10 menit dinyalakan."
  );

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between">
      <div>

        {/* ================= NAVBAR ================= */}
        <DashboardNavbar />

        {/* ================= MAIN CONTENT ================= */}
        {/* Padding atas diubah menjadi pt-24 agar tidak tertutup navbar fixed */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6">

          {/* Breadcrumb & Header Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <Link href="/laporan" className="hover:underline">Laporan</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/laporan" className="hover:underline">Laporan Kerusakan</Link>
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">

            {/* 1. Pilih Fasilitas / Ruangan */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#131B2E] font-jakarta uppercase tracking-wider">
                Pilih Fasilitas / Ruangan <span className="text-red-500">*</span>
              </label>

              <div className="bg-[#F2F3FF]/70 border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-[#0D7C55] transition-all cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-10 rounded-xl bg-[#0D7C55] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#131B2E] font-jakarta text-sm">Laboratorium Komputer C — Gedung E, Lt. 2 (Ruang 204)</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-[#0D7C55]">
                        <CheckCircle2 className="w-3 h-3" /> Terdata Aktif
                      </span>
                    </div>
                    <p className="text-xs text-[#3E4942] mt-0.5">Kampus Utama • Fasilkom • Lab Pemrograman & Jaringan</p>
                  </div>
                </div>
                <div className="text-slate-400 hover:text-[#0D7C55]">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
              <p className="text-xs text-[#3E4942] flex items-center gap-1.5 pl-1">
                <Info className="w-3.5 h-3.5 text-[#0D7C55]" /> Tersedia 18 unit komputer dan perlengkapan proyektor terdata di ruangan ini.
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    selectedKategori === "proyektor"
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    selectedKategori === "ac"
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    selectedKategori === "listrik"
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    selectedKategori === "furnitur"
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 sm:col-span-2 ${
                    selectedKategori === "lainnya"
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
                <span className="text-xs text-slate-400 font-inter">184 / 500 karakter</span>
              </div>

              <textarea
                rows={4}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-[#F2F3FF]/40 text-xs text-[#131B2E] p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D7C55] leading-relaxed resize-none"
                placeholder="Jelaskan detail kerusakan..."
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-12 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                      <span>JPG</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#131B2E] font-jakarta">bukti_proyektor_rusak_lab_c.jpg</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500">2.4 MB</span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#0D7C55] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Terunggah & Terverifikasi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button className="p-2 bg-[#F2F3FF] hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs text-[#0D7C55] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Terdeteksi Aset: EPSON-EB2250U / INV-2022-FASIL-088 <span className="ml-2 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">Kecocokan 98%</span></span>
                </div>
              </div>

              <p className="text-xs text-slate-500 pl-1">
                Sertakan foto jarak dekat yang memperlihatkan kode aset / lampu indikator kerusakan untuk mempercepat persiapan suku cadang teknisi.
              </p>
            </div>

            {/* 5. Informasi Alur & Penanganan Otomatis */}
            <div className="bg-[#F2F3FF]/70 border border-slate-200/80 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#0D7C55] text-white rounded-xl shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#131B2E] font-jakarta">Informasi Alur & Penanganan Otomatis</p>
                <p className="text-[#3E4942] leading-relaxed">
                  Laporan yang Anda kirim akan langsung memperbarui status ruangan di Sistem SIKAK dan mengirim tiket prioritas ke Bagian Sarana & Prasarana (ULT). Jadwal reservasi umum pada ruangan ini akan dibekukan sementara hingga status perbaikan dinyatakan selesai.
                </p>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <p className="text-xs text-slate-500 italic">
                Draf formulir tersimpan otomatis pukul 09:42 WIB
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Link
                  href="/laporan"
                  className="px-6 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors font-jakarta text-center"
                >
                  Batal
                </Link>

                <Link
                  href="/laporan/saya"
                  className="flex items-center justify-center gap-2 bg-[#0D7C55] hover:bg-[#006141] text-white px-6 py-3 rounded-2xl text-xs font-semibold shadow-sm transition-all font-jakarta"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan</span>
                </Link>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}