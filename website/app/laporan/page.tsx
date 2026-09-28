"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Wrench,
  Mailbox,
  CheckCircle2,
  Plus,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

export default function LaporanKerusakanPage() {
  const [activeTab, setActiveTab] = useState<"publik" | "saya">("publik");

  // Contoh data user (opsional, sesuaikan dengan props Navbar Anda jika menggunakan data dari session)
  const currentUser = {
    name: "Izzatu Khoirul Fata",
    email: "izzatu@students.undip.ac.id",
    role: "Mahasiswa",
    identifier: "24060124120039",
  };

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between pt-[64px]">
      <div>
        {/* ================= NAVBAR TERPUSAT ================= */}
        <Navbar user={currentUser} />

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-6">

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <span>Laporan</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0D7C55] font-semibold">Laporan Kerusakan</span>
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

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/laporan/saya"
                  className="flex items-center gap-2.5 bg-[#006141] text-white px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm transition-all font-jakarta whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Detail & Progress Laporan Saya</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">1 Aktif</span>
                </Link>

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

          {/* STATS CARDS */}
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
                <Mailbox className="w-6 h-6" />
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

          {/* DATA SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab("publik")}
                  className={`pb-2 text-sm font-bold border-b-2 transition-all font-jakarta ${
                    activeTab === "publik" ? "border-[#0D7C55] text-[#0D7C55]" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Semua Laporan Publik <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">14</span>
                </button>

                <Link href="/laporan/saya" className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 font-jakarta">
                  Laporan Saya <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">2</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#0D7C55] bg-emerald-50 px-3 py-1.5 rounded-full font-jakarta">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diverifikasi Sistem ULT Sarpras</span>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-[#3E4942] font-jakarta bg-[#F2F3FF]/40">
                    <th className="py-3.5 px-4 rounded-l-xl">Nama Fasilitas & Lokasi</th>
                    <th className="py-3.5 px-4">Kategori Kerusakan</th>
                    <th className="py-3.5 px-4">Tanggal Lapor</th>
                    <th className="py-3.5 px-4">Status Fasilitas</th>
                    <th className="py-3.5 px-4">Status Laporan</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-inter">
                  <tr className="hover:bg-[#F2F3FF]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#131B2E]">Lab Komputer C</td>
                    <td className="py-4 px-4 text-[#3E4942]">Proyektor & Display AV</td>
                    <td className="py-4 px-4 text-[#3E4942]">15 Sep 2026</td>
                    <td className="py-4 px-4"><span className="text-amber-600 font-semibold">Dalam Perbaikan</span></td>
                    <td className="py-4 px-4"><span className="text-blue-600 font-semibold">Diproses Teknisi</span></td>
                    <td className="py-4 px-4 text-right">
                      <Link href="/laporan/saya" className="px-3 py-1.5 bg-[#F2F3FF] hover:bg-slate-200 text-[#0D7C55] font-semibold rounded-lg text-xs font-jakarta">
                        Detail Progres
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
      <DashboardFooter />
    </div>
  );
}