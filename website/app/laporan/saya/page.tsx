"use client";

import React, { useState, useEffect } from "react";
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
  XCircle,
  Loader2,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Navbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

type ReportItem = {
  id: number;
  category: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  notes?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  Facility: {
    id: number;
    name: string;
    code: string;
    location: string;
    building: string;
    floor: string;
    status: string;
  };
};

export default function LaporanSayaPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState({
    totalKerusakan: 0,
    dalamPerbaikan: 0,
    laporanBaru: 0,
    diselesaikan: 0,
  });
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Ambil Data Laporan Saya & Statistik dari API (/api/reports/me & /api/reports)
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Laporan Saya
        const resMy = await fetch("/api/reports/me");
        if (resMy.ok) {
          const dataMy = await resMy.json();
          const list: ReportItem[] = dataMy.reports || [];
          setReports(list);

          if (list.length > 0) {
            setSelectedReportId(list[0].id);
          }
        } else {
          setErrorMsg("Gagal memuat laporan milik Anda.");
        }

        // 2. Fetch Statistik Publik
        const resPub = await fetch("/api/reports");
        if (resPub.ok) {
          const dataPub = await resPub.json();
          if (dataPub.stats) {
            setStats(dataPub.stats);
          }
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setErrorMsg("Gagal terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Laporan yang sedang dipilih untuk dipantau di Banner Atas
  const activeReport =
    reports.find((r) => r.id === selectedReportId) || reports[0];

  // Helper menentukan step aktif progress (1: PENDING, 2-3: IN_PROGRESS, 4: RESOLVED)
  function getStepStatus(status: string, stepNumber: number) {
    if (status === "RESOLVED") return "COMPLETED";
    if (status === "IN_PROGRESS") {
      return stepNumber <= 3 ? (stepNumber === 3 ? "ACTIVE" : "COMPLETED") : "PENDING";
    }
    // PENDING
    return stepNumber === 1 ? "COMPLETED" : stepNumber === 2 ? "ACTIVE" : "PENDING";
  }

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between">
      <div>
        {/* ================= NAVBAR ================= */}
        <Navbar />

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-6">
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

              {/* Tombol Buat Laporan Baru */}
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
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  TOTAL KERUSAKAN SAAT INI
                </p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">
                    {stats.totalKerusakan}
                  </span>
                  <span className="text-xs text-slate-500 font-inter">Fasilitas</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  DALAM PERBAIKAN
                </p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">
                    {stats.dalamPerbaikan}
                  </span>
                  <span className="text-xs text-slate-500 font-inter">Ruangan</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  LAPORAN BARU
                </p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">
                    {stats.laporanBaru}
                  </span>
                  <span className="text-xs text-slate-500 font-inter">Laporan Masuk</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  DISELESAIKAN PEKAN INI
                </p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#131B2E] font-jakarta">
                    {stats.diselesaikan}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold font-inter">
                    Fasilitas diperbaiki
                  </span>
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
              <Link
                href="/laporan"
                className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 font-jakarta"
              >
                Semua Laporan Publik
              </Link>
              <Link
                href="/laporan/saya"
                className="pb-2 text-sm font-bold border-b-2 border-[#0D7C55] text-[#0D7C55] font-jakarta"
              >
                Laporan Saya{" "}
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-[#0D7C55]">
                  {reports.length}
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#0D7C55] bg-emerald-50 px-3 py-1.5 rounded-full font-jakarta">
              <CheckCircle2 className="w-4 h-4" />
              <span>Diverifikasi Sistem ULT Sarpras</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-jakarta">
              <Loader2 className="w-4 h-4 animate-spin text-[#0D7C55]" />
              <span>Memuat data laporan Anda...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ================= DETAIL TIKET AKTIF DIPANTAU ================= */}
          {!loading && activeReport && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header Tiket */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                    <span className="bg-emerald-50 text-[#0D7C55] px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0D7C55] animate-pulse"></span>
                      TIKET AKTIF DIPANTAU
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-bold font-jakarta">
                      #LAP-{activeReport.id.toString().padStart(4, "0")}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      Diajukan {new Date(activeReport.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#131B2E] font-jakarta">
                    {activeReport.Facility.name} — {activeReport.category.toUpperCase()}
                  </h2>
                  <p className="text-xs text-[#3E4942]">
                    {activeReport.Facility.building}, {activeReport.Facility.floor} ({activeReport.Facility.location})
                  </p>
                </div>

                <div className="self-start lg:self-auto flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    <Wrench className="w-3.5 h-3.5" /> Status Ruang: {activeReport.Facility.status}
                  </span>
                </div>
              </div>

              {/* ================= TAHAPAN TINDAK LANJUT (STEPPER 4-STEP) ================= */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  TAHAPAN TINDAK LANJUT & RESOLUSI
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Step 1: Laporan Terkirim */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${
                      getStepStatus(activeReport.status, 1) === "COMPLETED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : "bg-slate-50 border border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">1. Laporan Terkirim</span>
                      <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                    </div>
                    <p className="text-[11px] text-[#3E4942]">
                      {new Date(activeReport.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </p>
                    <p className="text-[11px] font-semibold text-[#131B2E]">Sistem Menerima</p>
                  </div>

                  {/* Step 2: Diverifikasi Petugas */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${
                      getStepStatus(activeReport.status, 2) === "COMPLETED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : getStepStatus(activeReport.status, 2) === "ACTIVE"
                        ? "bg-blue-50 border border-blue-200 text-blue-700"
                        : "bg-slate-50 border border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">2. Diverifikasi Petugas</span>
                      {getStepStatus(activeReport.status, 2) === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#3E4942]">Terverifikasi ULT</p>
                    <p className="text-[11px] font-semibold text-[#131B2E]">Disetujui Disposisi</p>
                  </div>

                  {/* Step 3: Dalam Perbaikan */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${
                      getStepStatus(activeReport.status, 3) === "COMPLETED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : getStepStatus(activeReport.status, 3) === "ACTIVE"
                        ? "bg-[#0D7C55] text-white shadow-sm"
                        : "bg-slate-50 border border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">3. Dalam Perbaikan</span>
                      {getStepStatus(activeReport.status, 3) === "ACTIVE" ? (
                        <Wrench className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-90">Proses Perbaikan</p>
                    <p className="text-[11px] font-semibold">Teknisi di Ruangan</p>
                  </div>

                  {/* Step 4: Pengujian & Selesai */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${
                      activeReport.status === "RESOLVED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : "bg-slate-50 border border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">4. Pengujian & Selesai</span>
                      {activeReport.status === "RESOLVED" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-[11px]">
                      {activeReport.status === "RESOLVED" ? "Selesai" : "Menunggu QC Ruang"}
                    </p>
                    <p className="text-[11px] font-semibold">
                      {activeReport.status === "RESOLVED" ? "Siap Digunakan" : "Pemeriksaan Akhir"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= TEKNISI & CATATAN LAPANGAN ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* Kolom Kiri: Teknisi & Lampiran Foto */}
                <div className="lg:col-span-5 bg-[#F2F3FF]/60 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                    TEKNISI PENANGGUNG JAWAB
                  </p>

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#0D7C55] text-white flex items-center justify-center font-bold text-base shadow-sm font-jakarta">
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

                  {/* Lampiran Bukti Pengaduan */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                      LAMPIRAN BUKTI PENGADUAN ANDA
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-3 space-y-1">
                      <p className="text-xs font-bold text-[#131B2E] font-jakarta">
                        {activeReport.photoUrl ? activeReport.photoUrl.split("/").pop() : "bukti_foto_kerusakan.jpg"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Diunggah pada {new Date(activeReport.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Catatan Lapangan Tim Teknisi/Petugas */}
                <div className="lg:col-span-7 bg-[#F2F3FF]/60 border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                        CATATAN LAPANGAN TIM TEKNISI
                      </p>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        ● Terhubung dengan Database SIKAK
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D7C55] font-jakarta">
                        <ShieldCheck className="w-4 h-4" /> Catatan Resolusi Petugas
                      </div>

                      {activeReport.notes ? (
                        <p className="text-xs text-[#3E4942] leading-relaxed italic">
                          &ldquo;{activeReport.notes}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Belum ada catatan resolusi tertulis dari petugas. Petugas sedang memproses verifikasi dan tindakan di lapangan.
                        </p>
                      )}

                      <div className="pt-2 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100">
                        <p>
                          <span className="font-semibold text-[#131B2E]">Disposisi:</span> Subbag Sarpras & TI Kampus
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= RIWAYAT LAPORAN TABLE ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#131B2E] font-jakarta">
                  Riwayat Laporan Anda
                </h3>
                <p className="text-xs text-[#3E4942]">
                  Daftar pengaduan sarana dan prasarana yang telah Anda kirim
                </p>
              </div>
              <span className="text-xs text-slate-500 self-start sm:self-auto">
                Total: {reports.length} Tiket
              </span>
            </div>

            {!loading && reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Anda belum memiliki riwayat laporan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-[#3E4942] font-jakarta bg-[#F2F3FF]/40">
                      <th className="py-3.5 px-4 rounded-l-xl">ID Tiket</th>
                      <th className="py-3.5 px-4">Fasilitas & Lokasi</th>
                      <th className="py-3.5 px-4">Kategori & Deskripsi</th>
                      <th className="py-3.5 px-4">Status Tiket</th>
                      <th className="py-3.5 px-4">Status Ruangan</th>
                      <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-inter">
                    {reports.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F2F3FF]/30 transition-colors ${
                          selectedReportId === item.id ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">
                          #LAP-{item.id.toString().padStart(4, "0")}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-[#131B2E] font-jakarta">{item.Facility.name}</p>
                          <p className="text-[11px] text-[#3E4942]">
                            {item.Facility.building}, {item.Facility.floor}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-[#131B2E] uppercase text-[11px] font-jakarta">
                            {item.category}
                          </p>
                          <p className="text-[11px] text-[#3E4942] truncate max-w-[180px]">
                            {item.description}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              item.status === "PENDING"
                                ? "bg-purple-50 text-purple-700"
                                : item.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                            {item.Facility.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedReportId(item.id)}
                            className="px-3 py-1.5 bg-[#006141] hover:bg-[#0D7C55] text-white font-semibold rounded-lg text-xs transition-colors font-jakarta shadow-sm"
                          >
                            Detail & Pantau
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
