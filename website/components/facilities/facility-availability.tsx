"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import ReservationForm from "@/components/reservations/reservation-form";

type Availability = {
  facility: {
    id: number;
    name: string;
    status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  };
  date: string;
  timeZone: string;
  slots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
};

type Props = {
  facilityId: number;
  facilityName: string;
  userRole?: string;
};

export default function FacilityAvailability({
  facilityId,
  facilityName,
  userRole,
}: Props) {
  const [request, setRequest] = useState<{ date: string } | null>(null);
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const date = String(formData.get("date") ?? "");

    if (!date) return;

    setLoading(true);
    setError("");
    setData(null);
    setRequest({ date });
  }

  useEffect(() => {
    if (!request) return;

    const controller = new AbortController();
    const selectedDate = request.date;

    async function loadAvailability() {
      try {
        const params = new URLSearchParams({ date: selectedDate });

        const response = await fetch(
          `/api/facilities/${facilityId}/availability?${params}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Ketersediaan gagal dimuat.",
          );
        }

        if (!result.data || !Array.isArray(result.data.slots)) {
          throw new Error("Format data ketersediaan tidak sesuai.");
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat jadwal.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, [facilityId, request]);

  return (
    <section
      className="mt-6 rounded-xl border border-green-200 bg-white p-6"
      aria-labelledby="availability-heading"
    >
      <h2
        id="availability-heading"
        className="text-xl font-semibold text-gray-900"
      >
        Jadwal {facilityName}
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Pilih tanggal untuk melihat ketersediaan. Semua jam mengikuti
        WIB dan setiap slot berdurasi 30 menit. Pengajuan wajib
        dilakukan minimal 48 jam sebelum waktu mulai. Slot yang lebih
        dekat dari batas tersebut ditampilkan sebagai tidak tersedia.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <fieldset
          disabled={loading}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label
              htmlFor="availability-date"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal penggunaan
            </label>

            <input
              id="availability-date"
              name="date"
              type="date"
              required
              className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Cek ketersediaan"}
          </button>
        </fieldset>
      </form>

      {loading && (
        <p role="status" className="mt-5 text-gray-600">
          Memuat jadwal fasilitas...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {data && !loading && !error && (
        <>
          <p role="status" className="mt-6 text-sm text-gray-700">
            Jadwal tanggal {data.date} · WIB ·{" "}
            {data.slots.filter((slot) => slot.available).length} dari{" "}
            {data.slots.length} slot tersedia.
          </p>

          {data.facility.status === "MAINTENANCE" && (
            <p className="mt-3 rounded-lg bg-amber-50 p-4 text-amber-800">
              Fasilitas sedang dalam perbaikan.
            </p>
          )}

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.slots.map((slot) => (
              <li
                key={slot.startTime}
                className={`rounded-lg border p-3 ${
                  slot.available
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-gray-200 bg-gray-100 text-gray-600"
                }`}
              >
                <p className="font-semibold">
                  {slot.startTime}–{slot.endTime}
                </p>
                <p className="mt-1 text-sm">
                  {slot.available ? "Tersedia" : "Tidak tersedia"}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-gray-500">
            Ketersediaan dapat berubah. Klik cek ketersediaan kembali
            untuk memperbarui jadwal.
          </p>

                    {!userRole ? (
            <p className="mt-6 text-sm text-gray-700">
              Untuk mengajukan reservasi,{" "}
              <Link
                href="/login"
                className="font-semibold text-green-700 underline"
              >
                login terlebih dahulu
              </Link>
              .
            </p>
          ) : userRole !== "USER" ? (
            <p className="mt-6 text-sm text-gray-600">
              Pengajuan reservasi tersedia untuk akun mahasiswa,
              dosen, atau staf.
            </p>
          ) : data.facility.status === "ACTIVE" &&
            data.slots.some((slot) => slot.available) ? (
            <ReservationForm
              key={`${facilityId}-${data.date}`}
              facilityId={facilityId}
              facilityName={data.facility.name}
              date={data.date}
              slots={data.slots}
            />
          ) : (
            <p className="mt-6 text-sm text-gray-600">
              Tidak ada slot yang dapat diajukan pada tanggal ini.
            </p>
          )}
        </>
      )}
    </section>
  );
}