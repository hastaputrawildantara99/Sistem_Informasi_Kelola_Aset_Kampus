"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Wrench,
  CheckCircle2,
  Plus,
  MessageSquare,
  Phone,
  FileText,
  Clock,
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
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Ambil Data Sesi & Laporan Khusus User Yang Login
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Cek Sesi Login User
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.replace("/login");
          return;
        }

        const authData = await authRes.json();
        if (!authData.user) {
          router.replace("/login");
          return;
        }

        setCurrentUser(authData.user);

        // 2. Fetch Laporan Khusus Milik User Ini
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
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setErrorMsg("Gagal terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Fungsi untuk memilih laporan dan scroll halus ke bagian detail di bawah
  const handleSelectReport = (id: number) => {
    setSelectedReportId(id);
    setTimeout(() => {
      const el = document.getElementById("detail-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Laporan yang sedang dipilih untuk dipantau di Detail Card bawah
  const activeReport =
    reports.find((r) => r.id === selectedReportId) || reports[0];

  // Helper menentukan step aktif progress
  function getStepStatus(status: string, stepNumber: number) {
    if (status === "RESOLVED") return "COMPLETED";
    if (status === "IN_PROGRESS") {
      return stepNumber <= 3 ? (stepNumber === 3 ? "ACTIVE" : "COMPLETED") : "PENDING";
    }
    return stepNumber === 1 ? "COMPLETED" : "PENDING";
  }

  // Tampilan Loading saat memverifikasi sesi
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F3FF] flex flex-col justify-center items-center font-jakarta">
        <Loader2 className="w-8 h-8 text-[#0D7C55] animate-spin mb-2" />
        <p className="text-sm font-semibold text-slate-600">Memverifikasi sesi & memuat laporan Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between pt-[64px]">
      <div>
        {/* NAVBAR BERIDENTITAS USER */}
        <Navbar user={currentUser} />

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-6">
          {/* Breadcrumb & Header Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <Link href="/laporan" className="hover:underline">Laporan</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0D7C55] font-semibold">Laporan Saya</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#131B2E] font-jakarta tracking-tight">
                  Riwayat & Progress Laporan Saya
                </h1>
                <p className="text-sm text-[#3E4942] mt-1 max-w-3xl">
                  Pantau status penanganan, tindakan teknisi di lapangan, dan riwayat laporan kerusakan fasilitas yang pernah Anda kirimkan.
                </p>
              </div>

              {/* Action Button */}
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

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ================= 1. TABEL RIWAYAT LAPORAN (DI ATAS) ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#131B2E] font-jakarta">
                  Daftar Laporan Kerusakan Anda
                </h3>
                <p className="text-xs text-[#3E4942]">
                  Pilih salah satu laporan di bawah untuk melihat detail & progress perbaikan secara lengkap
                </p>
              </div>
              <span className="text-xs text-slate-500 self-start sm:self-auto font-semibold">
                Total: {reports.length} Tiket
              </span>
            </div>

            {/* Jika belum pernah membuat laporan */}
            {reports.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-[#131B2E] font-jakarta">
                  Anda Belum Memiliki Laporan Kerusakan
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-inter">
                  Jika Anda menemukan kendala fasilitas kampus, silakan kirimkan laporan baru untuk ditindaklanjuti oleh tim Sarpras.
                </p>
                <Link
                  href="/laporan/baru"
                  className="inline-flex items-center gap-2 bg-[#0D7C55] hover:bg-[#006141] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all font-jakarta mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Laporan Sekarang</span>
                </Link>
              </div>
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
                    {reports.map((item) => {
                      const isSelected = selectedReportId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#F2F3FF]/40 transition-colors ${isSelected ? "bg-emerald-50/60" : ""
                            }`}
                        >
                          <td className="py-4 px-4 font-bold text-[#0D7C55] font-jakarta">
                            #LAP-{item.id.toString().padStart(4, "0")}
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-[#131B2E] font-jakarta">{item.Facility?.name}</p>
                            <p className="text-[11px] text-[#3E4942]">
                              {item.Facility?.building}, {item.Facility?.floor}
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
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === "PENDING"
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
                              {item.Facility?.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleSelectReport(item.id)}
                              className={`px-3.5 py-1.5 font-semibold rounded-lg text-xs transition-all font-jakarta shadow-2xs flex items-center gap-1.5 ml-auto ${isSelected
                                  ? "bg-[#0D7C55] text-white ring-2 ring-emerald-600/30"
                                  : "bg-[#006141] hover:bg-[#0D7C55] text-white"
                                }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isSelected ? "Sedang Dipantau" : "Detail & Pantau"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= 2. DETAIL TIKET AKTIF DIPANTAU (DI BAWAH) ================= */}
          {reports.length > 0 && activeReport && (
            <div
              id="detail-section"
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              {/* Header Tiket */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                    <span className="bg-emerald-50 text-[#0D7C55] px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0D7C55] animate-pulse"></span>
                      DETAIL TIKET DIPILIH
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
                    {activeReport.Facility?.name} — {activeReport.category?.toUpperCase()}
                  </h2>
                  <p className="text-xs text-[#3E4942]">
                    {activeReport.Facility?.building}, {activeReport.Facility?.floor} ({activeReport.Facility?.location})
                  </p>
                </div>

                <div className="self-start lg:self-auto flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    <Wrench className="w-3.5 h-3.5" /> Status Ruang: {activeReport.Facility?.status}
                  </span>
                </div>
              </div>

              {/* Stepper Progress 4 Step */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3E4942] uppercase tracking-wider font-jakarta">
                  TAHAPAN TINDAK LANJUT & RESOLUSI
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Step 1 */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${getStepStatus(activeReport.status, 1) === "COMPLETED"
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

                  {/* Step 2 */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${getStepStatus(activeReport.status, 2) === "COMPLETED"
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

                  {/* Step 3 */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${getStepStatus(activeReport.status, 3) === "COMPLETED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : getStepStatus(activeReport.status, 3) === "ACTIVE"
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-slate-50 border border-slate-200 text-slate-400"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">3. Pengerjaan Teknisi</span>
                      {getStepStatus(activeReport.status, 3) === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0D7C55]" />
                      ) : (
                        <Wrench className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#3E4942]">Tim di lapangan</p>
                    <p className="text-[11px] font-semibold text-[#131B2E]">Proses Perbaikan</p>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`p-4 rounded-2xl space-y-1 ${getStepStatus(activeReport.status, 4) === "COMPLETED"
                        ? "bg-emerald-50 border border-emerald-200 text-[#0D7C55]"
                        : "bg-slate-50 border border-slate-200 text-slate-400"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-jakarta">4. Selesai & Normal</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-[#3E4942]">Fasilitas Siap</p>
                    <p className="text-[11px] font-semibold text-[#131B2E]">Tiket Ditutup</p>
                  </div>
                </div>
              </div>

              {/* Teknisi & Catatan Lapangan */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
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
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}
