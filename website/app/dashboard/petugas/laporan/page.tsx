"use client";

import Sidebar from "@/components/dashboard/sidebar";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  MapPin,
  User,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ReportStatus = "BARU" | "DIPROSES" | "SELESAI" | "DITOLAK";
type FacilityStatus = "AKTIF" | "DALAM_PERBAIKAN";
type FacilityConfirmationAction = "markMaintenance" | "reactivate";

type DamageReport = {
  id: string;
  fasilitas: string;
  lokasi: string;
  pelapor: string;
  tanggalLaporan: string;
  deskripsi: string;
  status: ReportStatus;
  catatanPenyelesaian?: string;
};

type Facility = {
  id: string;
  nama: string;
  lokasi: string;
  kategori: string;
  status: FacilityStatus;
  laporanKerusakan?: {
    id: string;
    tanggal: string;
    deskripsi: string;
  };
};

const initialReports: DamageReport[] = [
  {
    id: "LPR-001",
    fasilitas: "Ruang Kelas A101",
    lokasi: "Gedung A",
    pelapor: "Ahmad Fauzan",
    tanggalLaporan: "25 September 2026",
    deskripsi: "Proyektor tidak menyala saat digunakan untuk perkuliahan.",
    status: "BARU",
  },
  {
    id: "LPR-002",
    fasilitas: "Laboratorium Komputer 2",
    lokasi: "Gedung Laboratorium",
    pelapor: "Siti Rahma",
    tanggalLaporan: "25 September 2026",
    deskripsi: "Beberapa komputer tidak dapat terhubung ke jaringan kampus.",
    status: "BARU",
  },
  {
    id: "LPR-003",
    fasilitas: "Aula Kampus",
    lokasi: "Gedung Serbaguna",
    pelapor: "Budi Santoso",
    tanggalLaporan: "26 September 2026",
    deskripsi: "Lampu panggung sisi kanan berkedip dan perlu diperiksa.",
    status: "BARU",
  },
];

const initialFacilities: Facility[] = [
  {
    id: "FSL-001",
    nama: "Ruang Kelas A101",
    lokasi: "Gedung A",
    kategori: "Ruang Kelas",
    status: "AKTIF",
    laporanKerusakan: {
      id: "LPR-001",
      tanggal: "25 September 2026",
      deskripsi: "Proyektor tidak menyala saat digunakan untuk perkuliahan.",
    },
  },
  {
    id: "FSL-002",
    nama: "Laboratorium Komputer 2",
    lokasi: "Gedung Laboratorium",
    kategori: "Laboratorium",
    status: "DALAM_PERBAIKAN",
    laporanKerusakan: {
      id: "LPR-002",
      tanggal: "25 September 2026",
      deskripsi: "Beberapa komputer tidak dapat terhubung ke jaringan kampus.",
    },
  },
  {
    id: "FSL-003",
    nama: "Aula Kampus",
    lokasi: "Gedung Serbaguna",
    kategori: "Aula",
    status: "AKTIF",
    laporanKerusakan: {
      id: "LPR-003",
      tanggal: "26 September 2026",
      deskripsi: "Lampu panggung sisi kanan berkedip dan perlu diperiksa.",
    },
  },
  {
    id: "FSL-004",
    nama: "Ruang Rapat Dosen",
    lokasi: "Gedung Rektorat",
    kategori: "Ruang Rapat",
    status: "AKTIF",
  },
];

export default function PetugasLaporanPage() {
  const [reports, setReports] = useState(initialReports);
  const [facilities, setFacilities] = useState(initialFacilities);
  const [selectedReport, setSelectedReport] =
    useState<DamageReport | null>(null);
  const [selectedFacility, setSelectedFacility] =
    useState<Facility | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [completionError, setCompletionError] = useState("");
  const [facilityConfirmationAction, setFacilityConfirmationAction] =
    useState<FacilityConfirmationAction | null>(null);

  function updateReportStatus(id: string, status: ReportStatus) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id
          ? {
              ...report,
              status,
              catatanPenyelesaian:
                status === "SELESAI"
                  ? report.catatanPenyelesaian
                  : undefined,
            }
          : report
      )
    );
  }

  function openCompletionModal(report: DamageReport) {
    setSelectedReport(report);
    setCompletionNote(report.catatanPenyelesaian || "");
    setCompletionError("");
    setShowCompletionModal(true);
  }

  function closeCompletionModal() {
    setShowCompletionModal(false);
    setSelectedReport(null);
    setCompletionNote("");
    setCompletionError("");
  }

  function completeReport() {
    if (!selectedReport) {
      return;
    }

    if (!completionNote.trim()) {
      setCompletionError("Catatan penyelesaian wajib diisi.");
      return;
    }

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              status: "SELESAI",
              catatanPenyelesaian: completionNote.trim(),
            }
          : report
      )
    );

    closeCompletionModal();
  }

  function openFacilityConfirmation(
    facility: Facility,
    action: FacilityConfirmationAction
  ) {
    setSelectedFacility(facility);
    setFacilityConfirmationAction(action);
  }

  function closeFacilityConfirmation() {
    setSelectedFacility(null);
    setFacilityConfirmationAction(null);
  }

  function confirmFacilityStatusChange() {
    if (!selectedFacility || !facilityConfirmationAction) {
      return;
    }

    const nextStatus: FacilityStatus =
      facilityConfirmationAction === "markMaintenance"
        ? "DALAM_PERBAIKAN"
        : "AKTIF";

    setFacilities((currentFacilities) =>
      currentFacilities.map((facility) =>
        facility.id === selectedFacility.id
          ? { ...facility, status: nextStatus }
          : facility
      )
    );

    closeFacilityConfirmation();
  }

  return (
    <>
      <Sidebar
        role="petugas"
        activeMenu="Laporan & Fasilitas"
        user={{
          name: "",
          email: "",
          role: "PETUGAS",
          jenisUser: null,
          identifier: null,
        }}
      />

      <main className="ml-[230px] min-h-screen bg-[#f7f9fc] px-8 py-7 text-gray-900">
        <section className="mb-8">
          <Link
            href="/dashboard/petugas"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#006B45] hover:underline"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>

          <div>
            <p className="text-sm font-medium text-[#006B45]">
              Modul Petugas
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Kelola Laporan & Fasilitas
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Tinjau laporan kerusakan, catat penyelesaian, dan kelola status
              fasilitas berdasarkan kondisi perbaikan.
            </p>
          </div>
        </section>

        <ModuleSection
          title="Laporan Kerusakan"
          description="Ubah status laporan dan simpan catatan penyelesaian saat penanganan selesai."
        >
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <SummaryCard
              title="Baru"
              value={countReportsByStatus(reports, "BARU")}
              description="Laporan baru masuk"
            />

            <SummaryCard
              title="Diproses"
              value={countReportsByStatus(reports, "DIPROSES")}
              description="Laporan sedang ditangani"
            />

            <SummaryCard
              title="Selesai"
              value={countReportsByStatus(reports, "SELESAI")}
              description="Laporan sudah ditutup"
            />

            <SummaryCard
              title="Ditolak"
              value={countReportsByStatus(reports, "DITOLAK")}
              description="Laporan tidak diterima"
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                Daftar Laporan
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Laporan kerusakan fasilitas yang perlu dipantau petugas.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-bold text-gray-900">
                          {report.fasilitas}
                        </h4>

                        <ReportStatusBadge status={report.status} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        ID Laporan: {report.id}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <InfoItem
                          icon={User}
                          label="Pelapor"
                          value={report.pelapor}
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Tanggal laporan"
                          value={report.tanggalLaporan}
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Lokasi"
                          value={report.lokasi}
                        />

                        <InfoItem
                          icon={ClipboardList}
                          label="Status"
                          value={report.status}
                        />
                      </div>

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Deskripsi kerusakan
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {report.deskripsi}
                        </p>
                      </div>

                      {report.catatanPenyelesaian && (
                        <div className="mt-4 rounded-lg bg-emerald-50 p-3">
                          <p className="text-xs font-semibold uppercase text-[#006B45]">
                            Catatan penyelesaian
                          </p>

                          <p className="mt-1 text-sm text-emerald-900">
                            {report.catatanPenyelesaian}
                          </p>
                        </div>
                      )}
                    </div>

                    <ReportActions
                      report={report}
                      onProcess={() =>
                        updateReportStatus(report.id, "DIPROSES")
                      }
                      onReject={() =>
                        updateReportStatus(report.id, "DITOLAK")
                      }
                      onComplete={() => openCompletionModal(report)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ModuleSection>

        <ModuleSection
          title="Status Fasilitas"
          description="Tandai fasilitas dalam perbaikan dan aktifkan kembali setelah penanganan selesai."
        >
          <section className="mb-6 grid gap-4 md:grid-cols-2">
            <SummaryCard
              title="Aktif"
              value={countFacilitiesByStatus(facilities, "AKTIF")}
              description="Fasilitas tersedia untuk digunakan"
            />

            <SummaryCard
              title="Dalam Perbaikan"
              value={countFacilitiesByStatus(
                facilities,
                "DALAM_PERBAIKAN"
              )}
              description="Fasilitas sementara tidak tersedia"
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                Daftar Fasilitas
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Fasilitas yang relevan dengan laporan kerusakan operasional.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-bold text-gray-900">
                          {facility.nama}
                        </h4>

                        <FacilityStatusBadge status={facility.status} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        ID Fasilitas: {facility.id}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <InfoItem
                          icon={Building2}
                          label="Kategori"
                          value={facility.kategori}
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Lokasi"
                          value={facility.lokasi}
                        />

                        <InfoItem
                          icon={ClipboardList}
                          label="Status"
                          value={formatFacilityStatus(facility.status)}
                        />

                        <InfoItem
                          icon={Wrench}
                          label="Reservasi"
                          value={
                            facility.status === "DALAM_PERBAIKAN"
                              ? "Tidak tersedia sementara"
                              : "Tersedia"
                          }
                        />
                      </div>

                      {facility.laporanKerusakan ? (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-semibold uppercase text-gray-400">
                            Informasi laporan
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {facility.laporanKerusakan.id} -{" "}
                            {facility.laporanKerusakan.tanggal}
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {facility.laporanKerusakan.deskripsi}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg bg-emerald-50 p-3">
                          <p className="text-xs font-semibold uppercase text-[#006B45]">
                            Informasi laporan
                          </p>

                          <p className="mt-1 text-sm text-emerald-900">
                            Belum ada laporan kerusakan aktif untuk fasilitas
                            ini.
                          </p>
                        </div>
                      )}
                    </div>

                    <FacilityActions
                      facility={facility}
                      onMarkMaintenance={() =>
                        openFacilityConfirmation(
                          facility,
                          "markMaintenance"
                        )
                      }
                      onReactivate={() =>
                        openFacilityConfirmation(facility, "reactivate")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ModuleSection>

        <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-900">
            Catatan integrasi
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Data pada halaman ini masih berupa data contoh. Setelah modul
            laporan dan fasilitas tersedia, status, catatan penyelesaian, dan
            ketersediaan reservasi akan dihubungkan ke backend.
          </p>
        </section>
      </main>

      {showCompletionModal && selectedReport && (
        <CompletionModal
          completionError={completionError}
          completionNote={completionNote}
          report={selectedReport}
          onChangeNote={(value) => {
            setCompletionNote(value);
            setCompletionError("");
          }}
          onClose={closeCompletionModal}
          onConfirm={completeReport}
        />
      )}

      {selectedFacility && facilityConfirmationAction && (
        <FacilityConfirmationModal
          action={facilityConfirmationAction}
          facility={selectedFacility}
          onClose={closeFacilityConfirmation}
          onConfirm={confirmFacilityStatusChange}
        />
      )}
    </>
  );
}

function countReportsByStatus(
  reports: DamageReport[],
  status: ReportStatus
) {
  return reports.filter((report) => report.status === status).length;
}

function countFacilitiesByStatus(
  facilities: Facility[],
  status: FacilityStatus
) {
  return facilities.filter((facility) => facility.status === status).length;
}

function formatFacilityStatus(status: FacilityStatus) {
  return status === "DALAM_PERBAIKAN" ? "Dalam Perbaikan" : "Aktif";
}

function ModuleSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-gray-200 pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-600">{title}</p>

      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ReportActions({
  report,
  onProcess,
  onReject,
  onComplete,
}: {
  report: DamageReport;
  onProcess: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const isClosed =
    report.status === "SELESAI" || report.status === "DITOLAK";

  if (isClosed) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
      {report.status === "BARU" && (
        <button
          type="button"
          onClick={onProcess}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#006B45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005538]"
        >
          <CheckCircle2 size={17} />
          Proses
        </button>
      )}

      <button
        type="button"
        onClick={onComplete}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#006B45] transition hover:bg-emerald-50"
      >
        <FileCheck2 size={17} />
        Selesaikan
      </button>

      <button
        type="button"
        onClick={onReject}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        <XCircle size={17} />
        Tolak
      </button>
    </div>
  );
}

function FacilityActions({
  facility,
  onMarkMaintenance,
  onReactivate,
}: {
  facility: Facility;
  onMarkMaintenance: () => void;
  onReactivate: () => void;
}) {
  if (facility.status === "DALAM_PERBAIKAN") {
    return (
      <button
        type="button"
        onClick={onReactivate}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#006B45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005538]"
      >
        <CheckCircle2 size={17} />
        Aktifkan Kembali
      </button>
    );
  }

  if (!facility.laporanKerusakan) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onMarkMaintenance}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
    >
      <Wrench size={17} />
      Tandai Dalam Perbaikan
    </button>
  );
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const badgeClassName =
    status === "SELESAI"
      ? "bg-emerald-50 text-[#006B45]"
      : status === "DIPROSES"
        ? "bg-blue-50 text-blue-700"
        : status === "DITOLAK"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
    >
      {status}
    </span>
  );
}

function FacilityStatusBadge({ status }: { status: FacilityStatus }) {
  const badgeClassName =
    status === "DALAM_PERBAIKAN"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-[#006B45]";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
    >
      {formatFacilityStatus(status)}
    </span>
  );
}

function CompletionModal({
  completionError,
  completionNote,
  report,
  onChangeNote,
  onClose,
  onConfirm,
}: {
  completionError: string;
  completionNote: string;
  report: DamageReport;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Selesaikan Laporan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Isi catatan penyelesaian untuk laporan{" "}
              <span className="font-semibold">{report.id}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5">
          <label
            htmlFor="completionNote"
            className="text-sm font-semibold text-gray-700"
          >
            Catatan penyelesaian
          </label>

          <textarea
            id="completionNote"
            value={completionNote}
            onChange={(event) => onChangeNote(event.target.value)}
            placeholder="Contoh: Proyektor sudah diperbaiki dan berhasil diuji."
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#006B45] focus:ring-2 focus:ring-emerald-100"
          />

          {completionError && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {completionError}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#006B45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005538]"
          >
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
}

function FacilityConfirmationModal({
  action,
  facility,
  onClose,
  onConfirm,
}: {
  action: FacilityConfirmationAction;
  facility: Facility;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isMarkingMaintenance = action === "markMaintenance";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              {isMarkingMaintenance ? (
                <AlertTriangle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              {isMarkingMaintenance
                ? "Tandai Dalam Perbaikan"
                : "Aktifkan Kembali"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              {isMarkingMaintenance
                ? "Fasilitas akan ditandai dalam perbaikan dan sementara tidak tersedia untuk reservasi."
                : "Fasilitas akan diaktifkan kembali dan dapat digunakan lagi."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Fasilitas
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {facility.nama}
          </p>

          <p className="mt-1 text-sm text-gray-600">{facility.lokasi}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={
              isMarkingMaintenance
                ? "rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                : "rounded-lg bg-[#006B45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005538]"
            }
          >
            {isMarkingMaintenance ? "Tandai Perbaikan" : "Aktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-[#006B45]" />

      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-0.5 font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
