"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import FacilityAvailability from "./facility-availability";


type FacilityType =
  | "CLASSROOM"
  | "HALL"
  | "LABORATORY"
  | "EQUIPMENT"
  | "FIELD";

type Facility = {
  id: number;
  code: string;
  name: string;
  type: FacilityType;
  location: string;
  capacity: number;
  description: string | null;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
};

const typeLabels: Record<FacilityType, string> = {
  CLASSROOM: "Ruang kelas",
  HALL: "Aula",
  LABORATORY: "Laboratorium",
  EQUIPMENT: "Alat",
  FIELD: "Lapangan",
};

const statusLabels: Record<Facility["status"], string> = {
  ACTIVE: "Aktif",
  MAINTENANCE: "Dalam perbaikan",
  INACTIVE: "Nonaktif",
};

type FacilityListProps = {
  userRole?: string;
};

export default function FacilityList({ userRole }: FacilityListProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({ query: "" });
  const [selectedFacility, setSelectedFacility] = useState<
    Pick<Facility, "id" | "name"> | null
  >(null);
  const schedulePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFacility) {
      schedulePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedFacility]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const field of ["type", "location", "minCapacity"]) {
      const value = String(formData.get(field) ?? "").trim();

      if (value) {
        params.set(field, value);
      }
    }

    setSelectedFacility(null);
    setLoading(true);
    setError("");
    setSearch({ query: params.toString() });
  }

  function handleReset() {
    setSelectedFacility(null);
    setLoading(true);
    setError("");
    setSearch({ query: "" });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadFacilities() {
      try {
        const url = search.query
          ? `/api/facilities?${search.query}`
          : "/api/facilities";

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Daftar fasilitas gagal dimuat.",
          );
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Format data fasilitas tidak sesuai.");
        }

        if (!controller.signal.aborted) {
          setFacilities(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat fasilitas.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadFacilities();

    return () => controller.abort();
  }, [search]);

  return (
    <section
      className="mx-auto max-w-6xl px-6 py-10"
      aria-labelledby="facility-heading"
    >
      <p className="text-sm font-semibold text-green-700">
        FASILITAS KAMPUS
      </p>

      <h1
        id="facility-heading"
        className="mt-2 text-3xl font-bold text-gray-900"
      >
        Katalog Fasilitas
      </h1>

      <p className="mt-3 text-gray-600">
        Temukan fasilitas yang sesuai dengan kebutuhan kegiatanmu.
        Jam operasional 07.00–20.00 WIB.
      </p>

            <form
        onSubmit={handleSearch}
        onReset={handleReset}
        className="mt-8 rounded-xl border border-gray-200 bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="facility-type"
              className="block text-sm font-medium text-gray-700"
            >
              Tipe fasilitas
            </label>

            <select
              id="facility-type"
              name="type"
              defaultValue=""
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
            >
              <option value="">Semua tipe</option>
              <option value="CLASSROOM">Ruang kelas</option>
              <option value="HALL">Aula</option>
              <option value="LABORATORY">Laboratorium</option>
              <option value="EQUIPMENT">Alat</option>
              <option value="FIELD">Lapangan</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="facility-location"
              className="block text-sm font-medium text-gray-700"
            >
              Lokasi
            </label>

            <input
              id="facility-location"
              name="location"
              type="text"
              placeholder="Contoh: Gedung A"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="facility-capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Kapasitas minimum
            </label>

            <input
              id="facility-capacity"
              name="minCapacity"
              type="number"
              min={1}
              max={2147483647}
              step={1}
              placeholder="Contoh: 30"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Cari fasilitas"}
          </button>

          <button
            type="reset"
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset filter
          </button>
        </div>
      </form>

      {selectedFacility && (
        <div ref={schedulePanelRef} className="scroll-mt-24">
          <FacilityAvailability
            key={selectedFacility.id}
            facilityId={selectedFacility.id}
            facilityName={selectedFacility.name}
            userRole={userRole}
          />

          <button
            type="button"
            onClick={() => setSelectedFacility(null)}
            className="mt-3 text-sm font-medium text-gray-600 underline"
          >
            Tutup jadwal
          </button>
        </div>
      )}

      {loading && (
        <p role="status" className="mt-8 text-gray-600">
          Memuat fasilitas...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-xl bg-red-50 p-5 text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 font-semibold underline"
          >
            Muat ulang halaman
          </button>
        </div>
      )}

      {!loading && !error && facilities.length === 0 && (
        <p className="mt-8 rounded-xl bg-white p-6 text-gray-600">
          Tidak ada fasilitas yang sesuai. Coba ubah atau reset filter.
        </p>
      )}

      {!loading && !error && facilities.length > 0 && (
        <>
          <p className="mt-8 text-sm text-gray-600">
            Menampilkan {facilities.length} fasilitas
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <article
                key={facility.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-green-700">
                  {typeLabels[facility.type]}
                </p>

                <h2 className="mt-2 text-xl font-semibold text-gray-900">
                  {facility.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {facility.code}
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Lokasi</dt>
                    <dd className="font-medium text-gray-900">
                      {facility.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Kapasitas</dt>
                    <dd className="font-medium text-gray-900">
                      {facility.capacity}
                    </dd>
                  </div>
                </dl>

                {facility.description && (
                  <p className="mt-4 text-sm text-gray-600">
                    {facility.description}
                  </p>
                )}

                <span
                  className={`mt-5 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    facility.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {statusLabels[facility.status]}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFacility({
                      id: facility.id,
                      name: facility.name,
                    })
                  }
                  aria-label={`Lihat jadwal ${facility.name}`}
                  className="mt-5 block w-full rounded-lg border border-green-700 px-4 py-2 font-medium text-green-700 hover:bg-green-50"
                >
                  Lihat jadwal
              </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}