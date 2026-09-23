"use client";

import Sidebar from "@/components/dashboard/sidebar";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ReservationStatus =
  | "Menunggu"
  | "Disetujui"
  | "Ditolak"
  | "DIBATALKAN";

type Reservation = {
  id: string;
  pemohon: string;
  email: string;
  fasilitas: string;
  lokasi: string;
  tanggal: string;
  waktu: string;
  tujuan: string;
  status: ReservationStatus;
  alasanPenolakan?: string;
  alasanPembatalan?: string;
};

const initialReservations: Reservation[] = [
  {
    id: "RSV-001",
    pemohon: "Ahmad Fauzan",
    email: "ahmad.fauzan@example.com",
    fasilitas: "Ruang Kelas A101",
    lokasi: "Gedung A",
    tanggal: "25 September 2026",
    waktu: "08.00 - 10.00",
    tujuan: "Kegiatan diskusi kelompok",
    status: "Menunggu",
  },
  {
    id: "RSV-002",
    pemohon: "Siti Rahma",
    email: "siti.rahma@example.com",
    fasilitas: "Laboratorium Komputer 2",
    lokasi: "Gedung Laboratorium",
    tanggal: "25 September 2026",
    waktu: "10.00 - 12.00",
    tujuan: "Praktikum dan pengerjaan tugas",
    status: "Menunggu",
  },
  {
    id: "RSV-003",
    pemohon: "Budi Santoso",
    email: "budi.santoso@example.com",
    fasilitas: "Aula Kampus",
    lokasi: "Gedung Serbaguna",
    tanggal: "26 September 2026",
    waktu: "13.00 - 15.00",
    tujuan: "Seminar mahasiswa",
    status: "Menunggu",
  },
];

export default function PetugasReservasiPage() {
  const [reservations, setReservations] = useState(initialReservations);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationError, setCancellationError] = useState("");

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "Menunggu"
  );
  const processedReservations = reservations.filter(
    (reservation) => reservation.status !== "Menunggu"
  );

  function approveReservation(id: string) {
    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: "Disetujui" }
          : reservation
      )
    );

    setSelectedReservation(null);
  }

  function openRejectModal(reservation: Reservation) {
    setSelectedReservation(reservation);
    setRejectionReason("");
    setShowRejectModal(true);
  }

  function rejectReservation() {
    if (!selectedReservation || !rejectionReason.trim()) {
      return;
    }

    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              status: "Ditolak",
              alasanPenolakan: rejectionReason.trim(),
            }
          : reservation
      )
    );

    setShowRejectModal(false);
    setSelectedReservation(null);
    setRejectionReason("");
  }

  function openCancelModal(reservation: Reservation) {
    setSelectedReservation(reservation);
    setCancellationReason("");
    setCancellationError("");
    setShowCancelModal(true);
  }

  function closeCancelModal() {
    setShowCancelModal(false);
    setSelectedReservation(null);
    setCancellationReason("");
    setCancellationError("");
  }

  function cancelReservation() {
    if (!selectedReservation) {
      return;
    }

    if (!cancellationReason.trim()) {
      setCancellationError("Alasan pembatalan wajib diisi.");
      return;
    }

    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              status: "DIBATALKAN",
              alasanPembatalan: cancellationReason.trim(),
            }
          : reservation
      )
    );

    closeCancelModal();
  }

  return (
    <>
      <Sidebar
        role="petugas"
        activeMenu="Kelola Reservasi"
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
              Kelola Reservasi
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Periksa reservasi yang masuk dan tentukan apakah reservasi dapat
              disetujui atau ditolak.
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Menunggu"
            value={reservations.filter(
              (reservation) => reservation.status === "Menunggu"
            ).length}
            description="Reservasi yang belum diproses"
          />

          <SummaryCard
            title="Disetujui"
            value={reservations.filter(
              (reservation) => reservation.status === "Disetujui"
            ).length}
            description="Reservasi yang telah disetujui"
          />

          <SummaryCard
            title="Ditolak"
            value={reservations.filter(
              (reservation) => reservation.status === "Ditolak"
            ).length}
            description="Reservasi yang ditolak"
          />

          <SummaryCard
            title="Dibatalkan"
            value={reservations.filter(
              (reservation) => reservation.status === "DIBATALKAN"
            ).length}
            description="Reservasi yang dibatalkan"
          />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Antrian Reservasi
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Reservasi yang masih menunggu keputusan petugas.
            </p>
          </div>

          {pendingReservations.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarDays
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Tidak ada reservasi yang menunggu
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Semua reservasi yang masuk sudah diproses.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {reservation.fasilitas}
                        </h3>

                        <ReservationStatusBadge status={reservation.status} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        ID Reservasi: {reservation.id}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <InfoItem
                          icon={User}
                          label="Pemohon"
                          value={reservation.pemohon}
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Tanggal"
                          value={reservation.tanggal}
                        />

                        <InfoItem
                          icon={Clock3}
                          label="Waktu"
                          value={reservation.waktu}
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Lokasi"
                          value={reservation.lokasi}
                        />
                      </div>

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Tujuan penggunaan
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {reservation.tujuan}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
                      <button
                        type="button"
                        onClick={() => approveReservation(reservation.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#006B45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005538]"
                      >
                        <Check size={17} />
                        Setujui
                      </button>

                      <button
                        type="button"
                        onClick={() => openRejectModal(reservation)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <X size={17} />
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Reservasi Diproses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Reservasi yang sudah disetujui, ditolak, atau dibatalkan.
            </p>
          </div>

          {processedReservations.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-semibold text-gray-900">
                Belum ada reservasi yang diproses
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Reservasi akan muncul di sini setelah disetujui atau ditolak.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {processedReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {reservation.fasilitas}
                        </h3>

                        <ReservationStatusBadge status={reservation.status} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        ID Reservasi: {reservation.id}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <InfoItem
                          icon={User}
                          label="Pemohon"
                          value={reservation.pemohon}
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Tanggal"
                          value={reservation.tanggal}
                        />

                        <InfoItem
                          icon={Clock3}
                          label="Waktu"
                          value={reservation.waktu}
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Lokasi"
                          value={reservation.lokasi}
                        />
                      </div>

                      {reservation.alasanPenolakan && (
                        <ReasonBox
                          title="Alasan penolakan"
                          value={reservation.alasanPenolakan}
                        />
                      )}

                      {reservation.alasanPembatalan && (
                        <ReasonBox
                          title="Alasan pembatalan"
                          value={reservation.alasanPembatalan}
                        />
                      )}
                    </div>

                    {reservation.status === "Disetujui" && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(reservation)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Ban size={17} />
                        Batalkan Reservasi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-900">
            Catatan integrasi
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Data pada halaman ini masih berupa data contoh. Setelah modul
            reservasi tersedia, data contoh akan diganti dengan data
            Reservation dari database dan proses persetujuan akan dihubungkan
            ke backend.
          </p>
        </section>
      </main>

      {showRejectModal && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Tolak Reservasi
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Berikan alasan penolakan untuk reservasi{" "}
                  <span className="font-semibold">
                    {selectedReservation.id}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="rejectionReason"
                className="text-sm font-semibold text-gray-700"
              >
                Alasan penolakan
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                placeholder="Contoh: Jadwal fasilitas sudah digunakan untuk kegiatan lain."
                rows={4}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#006B45] focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={rejectReservation}
                disabled={!rejectionReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tolak Reservasi
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Batalkan Reservasi
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Berikan alasan pembatalan untuk reservasi{" "}
                  <span className="font-semibold">
                    {selectedReservation.id}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="cancellationReason"
                className="text-sm font-semibold text-gray-700"
              >
                Alasan pembatalan
              </label>

              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(event) => {
                  setCancellationReason(event.target.value);
                  setCancellationError("");
                }}
                placeholder="Contoh: Fasilitas harus digunakan untuk kegiatan mendesak kampus."
                rows={4}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#006B45] focus:ring-2 focus:ring-emerald-100"
              />

              {cancellationError && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {cancellationError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={cancelReservation}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Batalkan Reservasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const badgeClassName =
    status === "Disetujui"
      ? "bg-emerald-50 text-[#006B45]"
      : status === "DIBATALKAN"
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

function ReasonBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-sm text-gray-700">{value}</p>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
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
