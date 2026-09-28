"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Wrench,
  CheckCircle2,
  Plus,
  MessageSquare,
  Phone,
  FileText,
  Clock,
  AlertTriangle,
  XCircle
} from "lucide-react";
import Navbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

export default function LaporanSayaPage() {
  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between">
      <div>

        {/* ================= NAVBAR COMPONENT ================= */}
        <Navbar />

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-6">

          {/* Breadcrumb & Header Title */}
          <div className="space-y-2">
            {/* Breadcrumb yang diperbarui */}
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <Link href="/laporan" className="hover:underline">Laporan</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/laporan" className="hover:underline">Laporan Kerusakan</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0D7C55] font-semibold">Laporan Saya</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#131B2E] font-jakarta tracking-tight">
                  Laporan Kerusakan Fasilitas
                </h1>
                <p className="text-sm text-[#3E4942] mt-1 max-w-3xl">
                  Laporkan gangguan sarana fisik, utilitas, atau peralatan laboratorium kampus, serta pantau pembaruan teknisi dan status isolasi inventaris secara real-time.
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/laporan/baru"
                  className="flex items-center gap-2 bg-[#0D7C55] hover:bg-[#006141] text-white px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm transition-all font-jakarta whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Buat Laporan Baru</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">TOTAL KERUSAKAN SAAT INI</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">7</span>
                  <span className="text-xs text-slate-500 font-inter">Fasilitas</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">DALAM PERBAIKAN</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">4</span>
                  <span className="text-xs text-slate-500 font-inter">Ruangan</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">LAPORAN BARU</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">3</span>
                  <span className="text-xs text-slate-500 font-inter">Laporan Masuk</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">DISELESAIKAN PEKAN INI</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">12</span>
                  <span className="text-xs text-emerald-600 font-semibold font-inter">Fasilitas diperbaiki</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ================= TABS SWITCHER ================= */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-4">
              <Link href="/laporan" className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 font-jakarta">
                Semua Laporan Publik <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">14</span>
              </Link>
              <Link href="/laporan/saya" className="pb-2 text-sm font-bold border-b-2 border-[#0D7C55] text-[#0D7C55] font-jakarta">
                Laporan Saya <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-[#0D7C55]">2</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#0D7C55] bg-emerald-50 px-3 py-1.5 rounded-full font-jakarta">
              <CheckCircle2 className="w-4 h-4" />
              <span>Diverifikasi Sistem ULT Sarpras</span>
            </div>
          </div>

          {/* ================= DETAIL TIKET AKTIF DIPANTAU ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                  <span className="bg-emerald-50 text-[#0D7C55] px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0D7C55] animate-pulse"></span>
                    TIKET AKTIF DIPANTAU
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">#LAP-2026-042</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Diajukan 15 Sep 2026, 09:15 WIB</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#131B2E] font-jakarta">
                  Laboratorium Komputer C — Proyektor Overhead Berkedip & Lampu Indikator Merah
                </h2>
                <p className="text-xs text-[#3E4942]">
                  Gedung Perkuliahan E, Lantai 2, Ruang 204 • Tipe Masalah: Hardware & Kelistrikan Display AV
                </p>
              </div>

              <div className="self-start lg:self-auto">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <Wrench className="w-3.5 h-3.5" /> Status Ruang: Dalam Perbaikan
                </span>
              </div>
            </div>

            {/* TAHAPAN TINDAK LANJUT */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                TAHAPAN TINDAK LANJUT & RESOLUSI
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0D7C55] font-jakarta">1. Laporan Terkirim</span>
                    <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">15 Sep, 09:15 WIB</p>
                  <p className="text-[11px] font-semibold text-[#131B2E]">Sistem Menerima</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0D7C55] font-jakarta">2. Diverifikasi Petugas</span>
                    <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                  </div>
                  <p className="text-[11px] text-[#3E4942]">15 Sep, 09:30 WIB</p>
                  <p className="text-[11px] font-semibold text-[#131B2E]">Disetujui Disposisi</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D7C55] text-white shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-jakarta">3. Dalam Perbaikan</span>
                    <Wrench className="w-4 h-4 animate-bounce" />
                  </div>
                  <p className="text-[11px] text-emerald-100">15 Sep, 10:15 WIB</p>
                  <p className="text-[11px] font-semibold">Teknisi di Ruangan</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-jakarta">4. Pengujian & Selesai</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-[11px]">Estimasi 16 Sep, 14:00</p>
                  <p className="text-[11px] font-semibold">Menunggu QC Ruang</p>
                </div>
              </div>
            </div>

            {/* TEKNISI & CATATAN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-5 bg-[#F2F3FF]/60 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  TEKNISI PENANGGUNG JAWAB
                </p>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#0D7C55] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    BS
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#131B2E] font-jakarta">Budi Santoso, S.T.</p>
                    <p className="text-xs text-[#3E4942]">Pranata Sarpras AV & Elektrikal Senior</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">NIP: 198204122008011003</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#0D7C55] hover:bg-[#006141] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors font-jakarta">
                    <MessageSquare className="w-3.5 h-3.5" /> Kirim Pesan
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-[#3E4942] border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors font-jakarta">
                    <Phone className="w-3.5 h-3.5" /> Ext. 204
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                    LAMPIRAN BUKTI PENGADUAN ANDA
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black/5">
                    <div className="h-32 bg-slate-200 relative flex items-center justify-center text-slate-500 text-xs">
                      [Preview Foto Kerusakan Proyektor]
                    </div>
                    <div className="p-3 bg-white space-y-0.5">
                      <p className="text-xs font-bold text-[#131B2E]">Bukti_Proyektor_LabC.jpg</p>
                      <p className="text-[10px] text-slate-500">1.4 MB • Diunggah 15 Sep 2026, 09:15 WIB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#F2F3FF]/60 border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                      CATATAN LAPANGAN TIM TEKNISI
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">● Terakhir diperbarui 25 menit yang lalu</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D7C55]">
                      <CheckCircle2 className="w-4 h-4" /> Tindakan Penggantian Modul Optik Cadangan Berjalan
                    </div>
                    <p className="text-xs text-[#3E4942] leading-relaxed italic">
                      &ldquo;Unit proyektor utama mengalami overheat pada sirkuit ballast lampu merk Epson EB-2250U. Tim telah menurunkan unit dan memasangkan proyektor cadangan darurat (Laser EB-L520U) agar kegiatan praktikum siang tidak terganggu. Saat ini teknisi sedang menyelesaikan kalibrasi koneksi HDMI ke PC Dosen serta pengujian kestabilan daya selama 3 jam sebelum ruangan dibuka kembali.&rdquo;
                    </p>
                    <div className="pt-2 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100">
                      <p><span className="font-semibold text-[#131B2E]">Estimasi Ruang Kembali Normal:</span> 16 Sep 2026, 14:00 WIB</p>
                      <p><span className="font-semibold text-[#131B2E]">Disposisi:</span> Biro Sarpras Subbag TI</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">Memiliki informasi tambahan atau keluhan masih berulang setelah uji coba?</p>
                  <button className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#0D7C55] border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors font-jakarta">
                    <Plus className="w-3.5 h-3.5" /> Tambah Catatan Pelapor
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIWAYAT LAPORAN ANDA ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#131B2E] font-jakarta">Riwayat Laporan Anda</h3>
                <p className="text-xs text-[#3E4942]">Daftar 5 pengaduan sarana dan prasarana yang diajukan oleh akun Anda</p>
              </div>
              <span className="text-xs text-slate-500 self-start sm:self-auto">Menampilkan 5 dari 5 Tiket</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-[#3E4942] font-jakarta bg-[#F2F3FF]/40">
                    <th className="py-3.5 px-4 rounded-l-xl">ID Tiket</th>
                    <th className="py-3.5 px-4">Fasilitas & Lokasi</th>
                    <th className="py-3.5 px-4">Kategori & Bukti</th>
                    <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                    <th className="py-3.5 px-4">Status Tiket</th>
                    <th className="py-3.5 px-4">Status Ruangan</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-inter">
                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">#LAP-2026-042</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#131B2E] font-jakarta">Laboratorium Komputer C</p>
                      <p className="text-[11px] text-[#3E4942]">Gedung Perkuliahan E, Lt. 2, Ruang 204</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#131B2E]">Proyektor / Display AV</p>
                      <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">Lampu berkedip merah & ...</p>
                    </td>
                    <td className="py-4 px-4 text-[#3E4942]">15 Sep 2026<br /><span className="text-[10px]">09:15 WIB</span></td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                        Diproses Teknisi
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                        Dalam Perbaikan
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-[#006141] hover:bg-[#0D7C55] text-white font-semibold rounded-lg text-xs transition-colors font-jakarta shadow-sm">
                        Detail & Pantau
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">#LAP-2026-051</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#131B2E] font-jakarta">Smart Classroom E.302</p>
                      <p className="text-[11px] text-[#3E4942]">Gedung Perkuliahan E, Lantai 3</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#131B2E]">AC & Tata Udara</p>
                      <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">Tetesan air bocor & dengung</p>
                    </td>
                    <td className="py-4 px-4 text-[#3E4942]">Hari ini<br /><span className="text-[10px]">08:30 WIB</span></td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                        Menunggu Validasi
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        Antrean Inspeksi
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 bg-[#F2F3FF] hover:bg-slate-200 text-[#0D7C55] font-semibold rounded-lg text-xs transition-colors font-jakarta">
                        Detail
                      </button>
                      <button className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">#LAP-2026-038</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#131B2E] font-jakarta">Aula Utama Rektorat</p>
                      <p className="text-[11px] text-[#3E4942]">Sayap Barat, Lantai 1</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#131B2E]">Tata Suara & Mic</p>
                      <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">Feedback audio frekuensi...</p>
                    </td>
                    <td className="py-4 px-4 text-[#3E4942]">10 Sep 2026<br /><span className="text-[10px]">14:00 WIB</span></td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Selesai Ditangani
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Siap Digunakan
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-[#F2F3FF] hover:bg-slate-200 text-[#0D7C55] font-semibold rounded-lg text-xs transition-colors font-jakarta">
                        Catatan Resolusi
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">#LAP-2026-031</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#131B2E] font-jakarta">Smart Classroom E.201</p>
                      <p className="text-[11px] text-[#3E4942]">Gedung Perkuliahan E, Lantai 2</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#131B2E]">Kelistrikan Stopkontak</p>
                      <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">Stopkontak meja instruktur...</p>
                    </td>
                    <td className="py-4 px-4 text-[#3E4942]">02 Sep 2026<br /><span className="text-[10px]">11:20 WIB</span></td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Selesai Ditangani
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Siap Digunakan
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-[#F2F3FF] hover:bg-slate-200 text-[#0D7C55] font-semibold rounded-lg text-xs transition-colors font-jakarta">
                        Catatan Resolusi
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">#LAP-2026-024</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#131B2E] font-jakarta">Ruang Diskusi Perpustakaan</p>
                      <p className="text-[11px] text-[#3E4942]">Gedung R.A. Kartini, Lantai 3</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#131B2E]">Furnitur & Ergonomis</p>
                      <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">Engsel hidrolik kursi disk...</p>
                    </td>
                    <td className="py-4 px-4 text-[#3E4942]">25 Agu 2026<br /><span className="text-[10px]">10:00 WIB</span></td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Selesai Ditangani
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Siap Digunakan
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-[#F2F3FF] hover:bg-slate-200 text-[#0D7C55] font-semibold rounded-lg text-xs transition-colors font-jakarta">
                        Catatan Resolusi
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}