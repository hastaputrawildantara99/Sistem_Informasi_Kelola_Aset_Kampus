"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  MapPin,
  PhoneCall,
  BookOpen,
  Download,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Shield,
  ChevronRight
} from "lucide-react";
import Navbar from "@/components/dashboard/navbar";
import DashboardFooter from "@/components/dashboard/footer";

export default function BantuanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);

  const phoneNumber = '+62 812-3456-7890';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      id: 1,
      category: 'Reservasi & Waktu',
      question: 'Bagaimana ketentuan jam operasional dan slot waktu reservasi?',
      answer: 'Fasilitas akademik, laboratorium, dan auditorium dapat dipinjam pada jam operasional 07.00 - 20.00 WIB (Senin s.d. Jumat). Sistem SIKAK menerapkan pengaturan slot waktu presisi berbasis 30 menit (misal: 08.00-08.30, 08.30-09.00). Anda dapat memilih hingga maksimal 8 slot berturut-turut (4 jam) dalam satu permohonan selama ketersediaan ruangan masih terbuka hijau.',
      tags: ['Durasi 30 Menit per Slot', 'Maksimal 4 Jam per Sesi', 'Verifikasi Otomatis KRS/Ormawa']
    },
    {
      id: 2,
      category: 'Pembatasan & Perubahan',
      question: 'Bagaimana cara membatalkan reservasi yang sudah diajukan?',
      answer: 'Anda dapat membatalkan reservasi melalui menu "Reservasi Saya" sebelum status peminjaman disetujui oleh admin Sarpras atau sebelum batas waktu H-1 kegiatan.'
    },
    {
      id: 3,
      category: 'Reservasi & Waktu',
      question: 'Apakah jadwal peminjaman saya bisa dilihat oleh publik?',
      answer: 'Ya, jadwal peminjaman yang telah dikonfirmasi dapat dilihat pada halaman Katalog Fasilitas untuk transparansi ketersediaan ruangan.'
    },
    {
      id: 4,
      category: 'Laporan Kerusakan',
      question: 'Berapa lama proses perbaikan fasilitas setelah laporan kerusakan dikirim?',
      answer: 'Tim teknis Sarpras akan menindaklanjuti laporan kerusakan darurat dalam kurun waktu kurang dari 1x24 jam, sedangkan pemeliharaan rutin disesuaikan dengan antrean tiket.'
    },
    {
      id: 5,
      category: 'Reservasi & Waktu',
      question: 'Bagaimana jika terjadi kendala teknis mendadak saat kuliah / praktikum?',
      answer: 'Segera hubungi Hotline Darurat Sarpras melalui ekstensi kampus atau nomor darurat yang tertera di panel samping untuk penanganan cepat di lokasi.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesTab = activeTab === 'Semua' || faq.category === activeTab;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F2F3FF] text-[#131B2E] font-inter flex flex-col justify-between">
      <div>
        {/* ================= NAVBAR DASHBOARD ================= */}
        <Navbar />

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 space-y-6">

          {/* BREADCRUMB & HERO */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#3E4942] font-inter">
              <span>Bantuan</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0D7C55] font-semibold">Pusat Bantuan & Informasi</span>
            </div>

            <div className="text-center pt-2 pb-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-[#0D7C55] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 border border-emerald-100 shadow-2xs font-jakarta">
                <HelpCircle className="w-4 h-4" />
                <span>Knowledge Base & Helpdesk Terpadu Sistem informasi kelola aset kampus</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#131B2E] font-jakarta tracking-tight mb-3">
                Pusat Bantuan & Informasi SIKAK
              </h1>
              <p className="text-[#3E4942] max-w-2xl mx-auto text-sm sm:text-base mb-8 font-inter">
                Cari jawaban cepat seputar peminjaman fasilitas, aturan slot waktu, tracking tiket perbaikan, atau terhubung langsung dengan petugas Sarpras.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik bantuan (mis. aturan 30 menit, cara pembatalan, laporan rusak)..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C55] focus:border-transparent transition font-inter"
                />
              </div>

              {/* Quick Suggestion Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#3E4942] font-jakarta">
                <span className="font-medium text-slate-500">Paling sering dicari:</span>
                {['Waktu', 'Pembatalan', 'Reservasi', 'Dokumen Izin'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSearchQuery(item)}
                    className="bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-100 transition shadow-2xs font-medium text-slate-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT & CENTER COLUMN (FAQ) */}
            <div className="lg:col-span-2 space-y-6">

              {/* FAQ Container Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-50 text-[#0D7C55] rounded-xl">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#131B2E] font-jakarta">Pertanyaan Sering Diajukan (FAQ)</h2>
                  </div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-jakarta">
                    {filteredFaqs.length} Panduan
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-100">
                  {['Semua', 'Reservasi & Waktu', 'Pembatasan & Perubahan', 'Laporan Kerusakan'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition font-jakarta ${
                        activeTab === tab
                          ? 'bg-[#006141] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Accordion List */}
                <div className="divide-y divide-slate-100 mt-4">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => {
                      const isOpen = openFaq === faq.id;
                      return (
                        <div key={faq.id} className="py-4">
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                            className="w-full flex items-center justify-between text-left group focus:outline-none"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-emerald-50 group-hover:text-[#0D7C55] transition font-jakarta">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="text-sm font-semibold text-[#131B2E] group-hover:text-[#0D7C55] transition font-jakarta">
                                {faq.question}
                              </span>
                            </div>
                            <div className={`p-1.5 rounded-full transition ${isOpen ? 'bg-emerald-50 text-[#0D7C55]' : 'text-slate-400'}`}>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="mt-3 pl-10 pr-4 text-sm text-[#3E4942] space-y-3 font-inter">
                              <p>{faq.answer}</p>
                              {faq.tags && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {faq.tags.map((tag, tIdx) => (
                                    <span key={tIdx} className="inline-flex items-center space-x-1 bg-emerald-50 text-[#0D7C55] text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-100 font-jakarta">
                                      <Clock className="w-3 h-3" />
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 mt-4">
                                <span>Apakah informasi ini membantu Anda?</span>
                                <div className="flex items-center space-x-2">
                                  <button className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-[#0D7C55] rounded-lg transition font-medium">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>Ya</span>
                                  </button>
                                  <button className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition font-medium">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    <span>Tidak</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      Tidak ada FAQ yang sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card: Belum menemukan solusi? */}
              <div className="bg-gradient-to-r from-slate-100 to-emerald-50/50 rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-[#131B2E] mb-1 font-jakarta">Belum menemukan solusi yang tepat?</h3>
                  <p className="text-xs sm:text-sm text-[#3E4942] font-inter">
                    Ajukan tiket pertanyaan khusus langsung ke koordinator Sarana & Prasarana kampus Anda. Respon dalam jam kerja.
                  </p>
                </div>
                <button className="shrink-0 bg-[#006141] hover:bg-[#0D7C55] text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 font-jakarta">
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Pertanyaan Baru</span>
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN (SUPPORT WIDGETS) */}
            <div className="space-y-6">

              {/* Helpdesk Sarpras */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-50 text-[#0D7C55] rounded-xl">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-[#131B2E] text-base font-jakarta">Helpdesk Sarpras</h3>
                  </div>
                  <span className="inline-flex items-center space-x-1 bg-emerald-50 text-[#0D7C55] text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100 font-jakarta">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Online</span>
                  </span>
                </div>
                <p className="text-xs text-[#3E4942] mb-4 font-inter">Fast-Response Chat</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium font-jakarta">Nomor WhatsApp Resmi</div>
                    <div className="text-sm font-bold text-[#131B2E] tracking-wide font-inter">{phoneNumber}</div>
                  </div>
                  <button
                    onClick={handleCopyPhone}
                    className="p-2 text-slate-500 hover:text-[#0D7C55] bg-white border border-slate-200 rounded-lg shadow-2xs transition"
                    title="Salin Nomor"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#0D7C55]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#3E4942] mb-5 font-inter">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Senin - Jumat | 07.00 - 20.00 WIB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Rata-rata respon &lt; 15 menit</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#006141] hover:bg-[#0D7C55] text-white font-medium py-3 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 text-sm font-jakarta"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>

              {/* Surel Resmi Administrasi */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#131B2E] text-base font-jakarta">Surel Resmi Administrasi</h3>
                </div>
                <p className="text-xs text-[#3E4942] mb-4 font-inter">
                  Untuk pengajuan surat izin ormawa berkop resmi dan audiensi sarana:
                </p>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                  <span className="text-xs font-semibold text-slate-700 font-inter">sikak@undip.ac.id</span>
                  <a
                    href="mailto:sikak@undip.ac.id"
                    className="text-xs font-bold text-[#0D7C55] hover:underline font-jakarta"
                  >
                    Kirim
                  </a>
                </div>
              </div>

              {/* Lokasi Unit Layanan Terpadu */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#131B2E] text-base font-jakarta">Lokasi Unit Layanan Terpadu</h3>
                </div>
                <p className="text-xs text-[#3E4942] mb-4 font-inter">
                  Gedung Rektorat Sayap Timur, Lt. 1<br />
                  Bagian Sarana & Prasarana Kampus Terpadu
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <div className="inline-flex p-2 bg-emerald-50 text-[#0D7C55] rounded-full mb-2">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-[#131B2E] font-jakarta">Buka di Peta Navigasi Kampus</div>
                  <div className="text-[11px] text-[#3E4942] mt-0.5 font-inter">Akses pejalan kaki & parkir timur</div>
                </div>
              </div>

              {/* Hotline Darurat Sarpras */}
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-2 text-rose-700">
                  <PhoneCall className="w-5 h-5" />
                  <h3 className="font-bold text-base font-jakarta">Hotline Darurat Sarpras</h3>
                </div>
                <p className="text-xs text-rose-600 mb-4 leading-relaxed font-inter">
                  Kedaruratan Fasilitas di Lokasi (Konsleting, Pipa Pecah, Kebocoran Gas, atau Ancaman Keselamatan Ruang).
                </p>
                <div className="bg-white border border-rose-200 rounded-xl py-2.5 px-3 text-center text-rose-700 font-bold text-xs sm:text-sm shadow-2xs font-inter">
                  Ext. 4242 / (024) 746-0012
                </div>
              </div>

              {/* Ingin panduan lengkap? */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-2 text-emerald-900">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold text-base font-jakarta">Ingin panduan lengkap?</h3>
                </div>
                <p className="text-xs text-[#3E4942] mb-4 leading-relaxed font-inter">
                  Buku petunjuk PDF memuat alur verifikasi ormawa, panduan integrasi sistem kalender, dan SOP peminjaman barang inventaris.
                </p>
                <button className="w-full bg-[#006141] hover:bg-[#0D7C55] text-white font-medium py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-xs font-jakarta">
                  <Download className="w-4 h-4" />
                  <span>Unduh Panduan Penggunaan (PDF)</span>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* FOOTER */}
      <DashboardFooter />
    </div>
  );
}