"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Wrench,
  Mailbox,
  CheckCircle2,
  Plus,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";
import Navbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

type ReportItem = {
  id: number;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  Facility: {
    name: string;
    building: string;
    floor: string;
    location: string;
    status: string;
  };
};

export default function LaporanKerusakanPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState({
    totalKerusakan: 0,
    dalamPerbaikan: 0,
    laporanBaru: 0,
    diselesaikan: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Cek Sesi Login User (Wajib Login) & Ambil Data Laporan Publik + Statistik
  useEffect(() => {
    async function checkAuthAndFetchReports() {
      try {
        // 1. Cek Sesi Login User
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          // Menggunakan replace agar tombol Back browser tidak terjebak loop
          router.replace("/login");
          return;
        }

        const authData = await authRes.json();
        if (!authData.user) {
          router.replace("/login");
          return;
        }

        setCurrentUser(authData.user);

        // 2. Ambil Data Laporan Publik & Statistik Real-Time
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          setErrorMsg("Gagal mengambil data laporan publik.");
        }
      } catch (err) {
        console.error("FETCH PUBLIC REPORTS ERROR:", err);
        setErrorMsg("Gagal terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchReports();
  }, [router]);

  // Indikator Loading saat memverifikasi sesi & data
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F3FF] flex flex-col justify-center items-center font-jakarta">
        <Loader2 className="w-8 h-8 text-[#0D7C55] animate-spin mb-2" />
        <p className="text-sm font-semibold text-slate-600">Memverifikasi sesi & memuat data...</p>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/laporan/saya"
                  className="flex items-center gap-2.5 bg-[#006141] text-white px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm transition-all font-jakarta whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Detail & Progress Laporan Saya</span>
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

          {/* STATS CARDS REAL-TIME */}
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
                <Mailbox className="w-6 h-6" />
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

          {/* ================= DATA SECTION ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-3">
                <span className="pb-2 text-sm font-bold border-b-2 border-[#0D7C55] text-[#0D7C55] font-jakarta">
                  Semua Laporan Publik{" "}
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-[#0D7C55]">
                    {reports.length}
                  </span>
                </span>

                <Link
                  href="/laporan/saya"
                  className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 font-jakarta"
                >
                  Laporan Saya
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#0D7C55] bg-emerald-50 px-3 py-1.5 rounded-full font-jakarta">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diverifikasi Sistem ULT Sarpras</span>
              </div>
            </div>

            {/* Error Feedback */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Empty State */}
            {reports.length === 0 && !errorMsg ? (
              <div className="text-center py-12 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium font-jakarta">
                  Belum ada laporan kerusakan yang tercatat di sistem.
                </p>
              </div>
            ) : (
              /* TABEL PUBLIK */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-[#3E4942] font-jakarta bg-[#F2F3FF]/40">
                      <th className="py-3.5 px-4 rounded-l-xl">Nama Fasilitas & Lokasi</th>
                      <th className="py-3.5 px-4">Kategori Kerusakan</th>
                      <th className="py-3.5 px-4">Tanggal Lapor</th>
                      <th className="py-3.5 px-4">Status Fasilitas</th>
                      <th className="py-3.5 px-4 rounded-r-xl">Status Laporan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-inter">
                    {reports.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F2F3FF]/30 transition-colors">
                        <td className="py-4 px-4 font-bold text-[#131B2E]">
                          <p className="font-bold text-[#131B2E] font-jakarta">{item.Facility?.name || "-"}</p>
                          <p className="text-[11px] text-[#3E4942]">
                            {item.Facility?.building}, {item.Facility?.floor} ({item.Facility?.location})
                          </p>
                        </td>
                        <td className="py-4 px-4 text-[#3E4942]">
                          <span className="font-semibold text-slate-800 uppercase text-[11px] font-jakarta block">
                            {item.category}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</p>
                        </td>
                        <td className="py-4 px-4 text-[#3E4942] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {item.Facility?.status || "RUSAK"}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === "PENDING"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : item.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                          >
                            {item.status}
                          </span>
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
