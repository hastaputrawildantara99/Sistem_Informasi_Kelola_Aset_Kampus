import React from "react";
import Link from "next/link";

export default function DashboardFooter() {
    return (
        <footer className="w-full border-t border-gray-100 bg-white py-6 mt-auto">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 sm:flex-row text-xs text-gray-500">
                <p>
                    &copy; {new Date().getFullYear()} SIKAK - Sistem Informasi Kelola Aset Kampus. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <Link href="/reservations" className="hover:text-blue-600 transition-colors">
                        Reservasi
                    </Link>
                    <Link href="/laporan" className="hover:text-blue-600 transition-colors">
                        Laporan Kerusakan
                    </Link>
                    <Link href="/bantuan" className="hover:text-blue-600 transition-colors">
                        Bantuan
                    </Link>
                </div>
            </div>
        </footer>
      <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-xs text-slate-500 sm:px-8">
        <p>
          © {new Date().getFullYear()} Sistem Informasi Kelola Aset Kampus.
          Semua hak dilindungi.
        </p>
      </footer>
    );
}
