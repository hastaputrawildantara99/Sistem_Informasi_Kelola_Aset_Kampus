"use client";

import { Bell, Search, UserCircle } from "lucide-react";

type PetugasTopbarProps = {
  name?: string | null;
  placeholder?: string;
};

export default function PetugasTopbar({
  name,
  placeholder = "Cari nama pelapor, fasilitas...",
}: PetugasTopbarProps) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BS";

  return (
    <header className="fixed left-[230px] right-0 top-0 z-40 flex h-[68px] items-center gap-5 border-b border-slate-200 bg-white/95 px-7 shadow-sm backdrop-blur">
      <div className="flex h-9 max-w-xl flex-1 items-center gap-3 rounded-lg bg-[#f5f6ff] px-3 text-xs text-slate-400">
        <Search size={16} />
        <span>{placeholder}</span>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <span className="hidden rounded-full bg-[#dff3e9] px-3 py-1 text-[10px] font-semibold text-[#08764f] sm:inline-flex">
          ● Shift Pagi: Aktif
        </span>
        <button type="button" aria-label="Notifikasi" className="relative text-slate-500">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#08764f] text-[11px] font-bold text-white">
            {initials}
          </div>
          <UserCircle size={18} className="text-[#08764f]" />
        </div>
      </div>
    </header>
  );
}
