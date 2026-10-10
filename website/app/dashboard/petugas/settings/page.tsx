"use client";

import Sidebar from "@/components/dashboard/sidebar";
import PetugasTopbar from "@/components/dashboard/petugas-topbar";
import { Bell, Check, LockKeyhole, MapPin, UserCircle } from "lucide-react";

export default function PetugasSettingsPage() {
  return (
    <>
      <Sidebar role="petugas" activeMenu="Pengaturan" user={{ name: "", email: "", role: "PETUGAS" }} />
      <main className="ml-[230px] min-h-screen bg-[#f4f3ff] px-7 pb-10 pt-[98px] text-[#172033]">
        <PetugasTopbar placeholder="Cari pengaturan operasional..." />
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-7">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#08764f]">Portal Operasional</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Pengaturan Akun & Operasional Petugas</h1>
            <p className="mt-2 text-sm text-slate-500">Kelola profil petugas, notifikasi, area binaan, dan keamanan akun.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
            <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(36,48,90,0.04)]">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#08764f] text-3xl font-bold text-white">BS</div>
                <h2 className="mt-4 font-bold">Petugas Operasional</h2>
                <p className="mt-1 text-xs text-slate-500">Portal Operasional</p>
              </div>
              <div className="mt-6 space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-2"><UserCircle size={15} className="text-[#08764f]" /> Profil & Identitas</p>
                <p className="flex items-center gap-2"><Bell size={15} className="text-[#08764f]" /> Preferensi Notifikasi</p>
                <p className="flex items-center gap-2"><MapPin size={15} className="text-[#08764f]" /> Shift & Area Binaan</p>
                <p className="flex items-center gap-2"><LockKeyhole size={15} className="text-[#08764f]" /> Keamanan</p>
              </div>
            </section>

            <div className="space-y-5">
              <SettingsCard title="Data Kontak Operasional & Darurat" icon={<UserCircle size={18} />}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingField label="Email SSO" value="Belum diatur" />
                  <SettingField label="No. WhatsApp Darurat" value="Belum diatur" />
                </div>
              </SettingsCard>
              <SettingsCard title="Notifikasi & Peringatan Operasional" icon={<Bell size={18} />}>
                <div className="space-y-3">
                  {['Alert Reservasi Baru', 'Alert Laporan Kerusakan Kritis', 'Peringatan Bentrok Jadwal'].map((label) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-[#f7f8ff] px-4 py-3 text-sm">
                      <span>{label}</span><span className="flex h-6 w-10 items-center justify-end rounded-full bg-[#08764f] px-1"><span className="h-4 w-4 rounded-full bg-white" /></span>
                    </div>
                  ))}
                </div>
              </SettingsCard>
              <SettingsCard title="Pengaturan Area & Delegasi Shift" icon={<MapPin size={18} />}>
                <p className="text-sm text-slate-500">Area binaan dan pembagian shift operasional dapat dikonfigurasi di sini.</p>
                <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#dff3e9] px-3 py-1 text-xs font-semibold text-[#08764f]">Gedung E</span><span className="rounded-full bg-[#dff3e9] px-3 py-1 text-xs font-semibold text-[#08764f]">Gedung C</span><span className="rounded-full bg-[#dff3e9] px-3 py-1 text-xs font-semibold text-[#08764f]">Rektorat</span></div>
              </SettingsCard>
              <div className="flex justify-end"><button className="inline-flex items-center gap-2 rounded-lg bg-[#08764f] px-5 py-2.5 text-sm font-semibold text-white"><Check size={16} /> Simpan Pengaturan</button></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function SettingsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(36,48,90,0.04)]"><div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold"><span className="text-[#08764f]">{icon}</span>{title}</div>{children}</section>;
}

function SettingField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><div className="mt-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">{value}</div></div>;
}
