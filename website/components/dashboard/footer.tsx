"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CalendarDays,
  ShieldCheck
} from "lucide-react";

export default function DashboardFooter() {
  return (
    <footer className="w-full bg-[#f8f9fc] text-slate-700 border-t border-slate-200 mt-auto">
      {/* Bagian Konten Utama */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Menggunakan grid-cols-5 agar lebar kolom pertama terkontrol dan tidak membuat gap jauh */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Kolom 1: Logo & Deskripsi (Mengambil 2 span grid) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="inline-block">
              <img
                src="/logo.svg"
                alt="Logo SIKAK"
                className="h-16 w-auto object-contain"
              />
            </div>

            <p className="text-xs text-slate-600 font-inter leading-relaxed max-w-sm">
              Portal Resmi Peminjaman dan Pemanfaatan Fasilitas & Sarana Prasarana Kampus Terpadu untuk Civitas Akademika dan Publik.
            </p>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 font-jakarta">
                <ShieldCheck className="w-3.5 h-3.5" />
                Terakreditasi Unggul
              </span>
            </div>
          </div>

          {/* Kolom 2: Universitas Diponegoro */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-jakarta">
              UNIVERSITAS DIPONEGORO
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-600 font-inter">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Jl. Prof. Soedarto, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah 50275</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>(024) 746-0012</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>sikak@undip.ac.id</span>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Operasional */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-jakarta">
              LAYANAN OPERASIONAL
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-600 font-inter">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Senin - Jumat</p>
                  <p className="text-[11px] text-slate-500">07.30 - 16.30 WIB</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Sabtu, Minggu & Hari Libur</p>
                  <p className="text-[11px] text-slate-500">Hanya Pelaksanaan Acara Terjadwal</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Tautan Cepat */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-jakarta">
              TAUTAN CEPAT
            </h3>

            <ul className="space-y-2 text-xs font-inter">
              <li>
                <Link href="/dashboard/katalog" className="text-slate-600 hover:text-emerald-700 transition-colors">
                  Katalog Ruang & Sarana
                </Link>
              </li>
              <li>
                <Link href="/dashboard/jadwal" className="text-slate-600 hover:text-emerald-700 transition-colors">
                  Jadwal Kalender Pemakaian
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sop" className="text-slate-600 hover:text-emerald-700 transition-colors">
                  SOP & Standar Biaya Sewa
                </Link>
              </li>
              <li>
                <Link href="/bantuan" className="text-slate-600 hover:text-emerald-700 transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bagian Copyright Bawah */}
      <div className="border-t border-slate-200 bg-[#f1f3f9] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] text-slate-500 font-inter">
            © 2026 SIKAK - Bagian Pengelolaan Sarana dan Prasarana Kampus. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}