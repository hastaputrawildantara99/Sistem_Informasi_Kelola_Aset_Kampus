"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type Reservation = {
  id: number;
  facilityId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  facility: {
    id: number;
    code: string;
    name: string;
    location: string;
  };
};

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "Menunggu persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

const statusStyles: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const CANCELLATION_NOTICE_MS = 24 * 60 * 60 * 1000;

function cancellationDeadline(startTime: string) {
  return new Date(
    new Date(startTime).getTime() - CANCELLATION_NOTICE_MS,
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [now, setNow] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelFeedback, setCancelFeedback] = useState<{
    reservationId: number;
    kind: "success" | "error";
    message: string;
    needsLogin?: boolean;
  } | null>(null);

  const cancellationInProgress = useRef(false);

  function refreshReservations() {
    if (cancellationInProgress.current) return;
    setCancelFeedback(null);
    setLoading(true);
    setError("");
    setNeedsLogin(false);
    setReservations([]);
    setRefreshCount((count) => count + 1);
  }

  // Effect pertama: memperbarui waktu untuk tampilan tombol.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Effect kedua: mengambil riwayat reservasi.
  useEffect(() => {
    const controller = new AbortController();

    async function loadReservations() {
      try {
        const response = await fetch("/api/reservations", {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          setNeedsLogin(response.status === 401);
          throw new Error(
            result.message || "Riwayat reservasi gagal dimuat.",
          );
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Format data riwayat tidak sesuai.");
        }

        setReservations(result.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat riwayat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadReservations();

    return () => controller.abort();
  }, [refreshCount]);

    async function handleCancel(
    reservation: Reservation,
    clickedAt: number,
    ) {
    if (cancellationInProgress.current) return;

    setCancelFeedback(null);

    const allowedStatus =
      reservation.status === "PENDING" ||
      reservation.status === "APPROVED";

    const deadline = cancellationDeadline(
      reservation.startTime,
    ).getTime();

    if (!allowedStatus || clickedAt > deadline) {
      setCancelFeedback({
        reservationId: reservation.id,
        kind: "error",
        message:
          "Reservasi tidak dapat dibatalkan. Periksa status dan batas pembatalannya.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Batalkan reservasi #${reservation.id} untuk ${reservation.facility.name}?\n\n` +
        `Jadwal: ${formatDateTime(reservation.startTime)} WIB.\n\n` +
        "Pembatalan tidak dapat dibatalkan kembali.",
    );

    if (!confirmed) return;

    cancellationInProgress.current = true;
    setCancellingId(reservation.id);

    try {
      const response = await fetch(
        `/api/reservations/${reservation.id}/cancel`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setCancelFeedback({
          reservationId: reservation.id,
          kind: "error",
          message:
            result.message ||
            "Pembatalan gagal. Klik Perbarui untuk memeriksa status terbaru.",
          needsLogin: response.status === 401,
        });
        return;
      }

      if (
        result.data?.id !== reservation.id ||
        result.data?.status !== "CANCELLED"
      ) {
        throw new Error("Respons pembatalan tidak sesuai.");
      }

      // Pertahankan informasi fasilitas yang sudah ada pada riwayat.
      setReservations((previous) =>
        previous.map((item) =>
          item.id === reservation.id
            ? {
                ...item,
                status: "CANCELLED",
                cancelledAt: result.data.cancelledAt,
                cancellationReason: result.data.cancellationReason,
                updatedAt: result.data.updatedAt,
              }
            : item,
        ),
      );

      setCancelFeedback({
        reservationId: reservation.id,
        kind: "success",
        message: `Reservasi #${reservation.id} berhasil dibatalkan.`,
      });
    } catch {
      setCancelFeedback({
        reservationId: reservation.id,
        kind: "error",
        message:
          "Hasil pembatalan belum dapat dipastikan. Klik Perbarui untuk memeriksa status sebelum mencoba kembali.",
      });
    } finally {
      cancellationInProgress.current = false;
      setCancellingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reservasi Saya
          </h1>
          <p className="mt-2 text-gray-600">
            Pantau pengajuanmu. Semua waktu ditampilkan dalam WIB.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={refreshReservations}
            disabled={loading || cancellingId !== null}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 disabled:opacity-50"
          >
            Perbarui
          </button>

          <Link
            href="/"
            className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
          >
            Buat reservasi
          </Link>
        </div>
      </div>

      {loading && (
        <p role="status" className="mt-8 text-gray-600">
          Memuat riwayat reservasi...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-xl bg-red-50 p-5 text-red-700"
        >
          <p>{error}</p>
          {needsLogin && (
            <Link
              href="/login"
              className="mt-3 inline-block font-semibold underline"
            >
              Login kembali
            </Link>
          )}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <p className="mt-8 rounded-xl bg-white p-6 text-gray-600">
          Belum ada reservasi. Klik “Buat reservasi” untuk memilih
          fasilitas dan jadwal.
        </p>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="mt-8 space-y-4">
          {reservations.map((reservation) => (
            <article
              key={reservation.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Reservasi #{reservation.id}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {reservation.facility.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {reservation.facility.location}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    statusStyles[reservation.status]
                  }`}
                >
                  {statusLabels[reservation.status]}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <p>
                  Mulai: {formatDateTime(reservation.startTime)} WIB
                </p>
                <p>
                  Selesai: {formatDateTime(reservation.endTime)} WIB
                </p>
              </div>

              <details className="mt-5 border-t border-gray-100 pt-4">
                <summary className="cursor-pointer font-medium text-green-700">
                  Lihat detail
                </summary>

                <dl className="mt-4 space-y-3 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold">Kode fasilitas</dt>
                    <dd>{reservation.facility.code}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Tujuan penggunaan</dt>
                    <dd className="whitespace-pre-wrap break-words">
                      {reservation.purpose}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Diajukan pada</dt>
                    <dd>{formatDateTime(reservation.createdAt)} WIB</dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Terakhir diperbarui</dt>
                    <dd>{formatDateTime(reservation.updatedAt)} WIB</dd>
                  </div>

                  {reservation.cancelledAt && (
                    <div>
                      <dt className="font-semibold">Dibatalkan pada</dt>
                      <dd>
                        {formatDateTime(reservation.cancelledAt)} WIB
                      </dd>
                    </div>
                  )}

                  {reservation.cancellationReason && (
                    <div>
                      <dt className="font-semibold">Alasan pembatalan</dt>
                      <dd className="whitespace-pre-wrap break-words">
                        {reservation.cancellationReason}
                      </dd>
                    </div>
                  )}
                </dl>
              </details>
              {(reservation.status === "PENDING" ||
                reservation.status === "APPROVED") && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">
                    Batas pembatalan:{" "}
                    {formatDateTime(
                      cancellationDeadline(
                        reservation.startTime,
                      ).toISOString(),
                    )}{" "}
                    WIB.
                  </p>

                  {now === null ? (
                    <p className="mt-2 text-sm text-gray-500">
                      Memeriksa batas pembatalan...
                    </p>
                  ) : now >
                    cancellationDeadline(
                      reservation.startTime,
                    ).getTime() ? (
                    <p className="mt-2 text-sm text-amber-800">
                      Batas pembatalan sudah lewat. Pembatalan oleh
                      pengguna paling lambat 24 jam sebelum mulai.
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleCancel(reservation, Date.now())}
                    disabled={
                      cancellingId !== null ||
                      now === null ||
                      now >
                        cancellationDeadline(
                          reservation.startTime,
                        ).getTime()
                    }
                    className="mt-3 rounded-lg border border-red-600 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingId === reservation.id
                      ? "Membatalkan..."
                      : "Batalkan reservasi"}
                  </button>
                </div>
              )}

              {cancelFeedback?.reservationId === reservation.id && (
                <div
                  role={
                    cancelFeedback.kind === "error" ? "alert" : "status"
                  }
                  className={`mt-4 rounded-lg p-4 text-sm ${
                    cancelFeedback.kind === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <p>{cancelFeedback.message}</p>

                  {cancelFeedback.needsLogin && (
                    <Link
                      href="/login"
                      className="mt-2 inline-block font-semibold underline"
                    >
                      Login kembali
                    </Link>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}