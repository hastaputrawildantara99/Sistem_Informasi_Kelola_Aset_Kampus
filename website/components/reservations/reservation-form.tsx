"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type Props = {
  facilityId: number;
  facilityName: string;
  date: string;
  slots: Slot[];
};

export default function ReservationForm({
  facilityId,
  facilityName,
  date,
  slots,
}: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const sendingRef = useRef(false);

  // Pilihan selesai hanya boleh melewati slot tersedia yang berurutan.
  const startIndex = slots.findIndex(
    (slot) => slot.startTime === startTime,
  );

  const endOptions: string[] = [];

  if (startIndex >= 0) {
    for (let index = startIndex; index < slots.length; index++) {
      if (!slots[index].available) break;
      endOptions.push(slots[index].endTime);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sendingRef.current || reservationId !== null) return;

    setError("");
    setNeedsLogin(false);

    if (!startTime || !endOptions.includes(endTime)) {
      setError("Pilih rentang waktu yang tersedia.");
      return;
    }

    const cleanPurpose = purpose.trim();

    if (!cleanPurpose || cleanPurpose.length > 2000) {
      setError("Tujuan wajib diisi, maksimal 2000 karakter.");
      return;
    }

    sendingRef.current = true;
    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facilityId,
          date,
          startTime,
          endTime,
          purpose: cleanPurpose,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setNeedsLogin(response.status === 401);
        setError(result.message || "Pengajuan reservasi gagal.");
        return;
      }

      if (typeof result.data?.id !== "number") {
        throw new Error("Respons pengajuan tidak sesuai.");
      }

      setReservationId(result.data.id);
    } catch {
      setError(
        "Hasil pengajuan belum dapat dipastikan karena gangguan koneksi atau respons. Periksa riwayat reservasi sebelum mengirim ulang.",
      );
    } finally {
      sendingRef.current = false;
      setSubmitting(false);
    }
  }

  if (reservationId !== null) {
    return (
      <div
        role="status"
        className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900"
      >
        <h3 className="font-semibold">Reservasi berhasil diajukan</h3>
        <p className="mt-2">Nomor reservasi: #{reservationId}</p>
        <p>
          {facilityName} · {date} · {startTime}–{endTime} WIB
        </p>
        <p className="mt-2 font-medium">
          Status: Menunggu persetujuan petugas.
        </p>
        <p className="mt-2 font-medium">
          Status: Menunggu persetujuan petugas.
        </p>

        <p className="mt-2 text-sm">
          Jadwal ini telah diblokir sementara selama pengajuan menunggu
          persetujuan petugas.
        </p>

        <Link
          href="/reservations"
          className="mt-4 inline-block font-semibold underline"
        >
          Lihat reservasi saya
        </Link>
        <Link
          href="/reservations"
          className="mt-4 inline-block font-semibold underline"
        >
          Lihat reservasi saya
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Ajukan reservasi
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        {facilityName} · Tanggal {date} · Semua jam dalam WIB.
      </p>

      <fieldset disabled={submitting} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reservation-start"
              className="block text-sm font-medium text-gray-700"
            >
              Jam mulai
            </label>

            <select
              id="reservation-start"
              required
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setEndTime("");
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
            >
              <option value="">Pilih jam mulai</option>
              {slots.map((slot) => (
                <option
                  key={slot.startTime}
                  value={slot.startTime}
                  disabled={!slot.available}
                >
                  {slot.startTime}
                  {!slot.available ? " — Tidak tersedia" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reservation-end"
              className="block text-sm font-medium text-gray-700"
            >
              Jam selesai
            </label>

            <select
              id="reservation-end"
              required
              disabled={!startTime}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
            >
              <option value="">Pilih jam selesai</option>
              {endOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="reservation-purpose"
            className="block text-sm font-medium text-gray-700"
          >
            Tujuan penggunaan
          </label>

          <textarea
            id="reservation-purpose"
            required
            maxLength={2000}
            rows={4}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Contoh: Diskusi kelompok mata kuliah PPK"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
          />
        </div>

        <p className="text-sm text-gray-600">
          Pengajuan wajib dilakukan minimal 48 jam sebelum waktu mulai
          dan akan diperiksa petugas. Pembatalan oleh pengguna paling
          lambat 24 jam sebelum waktu mulai.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Ajukan reservasi"}
        </button>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {needsLogin && (
        <Link
          href="/login"
          className="mt-3 inline-block font-medium text-green-700 underline"
        >
          Login kembali
        </Link>
      )}
    </form>
  );
}