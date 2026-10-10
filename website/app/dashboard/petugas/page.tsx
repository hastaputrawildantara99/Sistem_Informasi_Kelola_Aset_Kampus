"use client";

import Sidebar from "@/components/dashboard/sidebar";
import PetugasTopbar from "@/components/dashboard/petugas-topbar";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  PieChart,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

type ReservationQueueItem = {
  id: string;
  pemohon: string;
  fasilitas: string;
  tanggal: string;
  waktu: string;
  status: string;
};

type ReportQueueItem = {
  id: string;
  pelapor: string;
  fasilitas: string;
  kategori: string;
  tanggal: string;
  status: string;
};

type ApiReservation = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    name: string;
  };
  facility: {
    name: string;
  };
};

type ApiFacility = {
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
};

type ApiPayload<T> = {
  data?: T;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    jenisUser?: string | null;
    identifier?: string | null;
  } | null;
  message?: string;
};

type DashboardReport = {
  id: number;
  category: string;
  createdAt: string;
  status: string;
  user: { name: string };
  facility: { name: string };
};

type DashboardPayload = {
  reports: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    queue: DashboardReport[];
  };
  facilities: {
    active: number;
    maintenance: number;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(value));
}

function percentage(value: number, total: number) {
  return total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";
}

function formatTimeRange(startTime: string, endTime: string) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startTime))} - ${formatter.format(
    new Date(endTime),
  )}`;
}

function mapReservation(reservation: ApiReservation): ReservationQueueItem {
  return {
    id: String(reservation.id),
    pemohon: reservation.user.name,
    fasilitas: reservation.facility.name,
    tanggal: formatDate(reservation.startTime),
    waktu: formatTimeRange(reservation.startTime, reservation.endTime),
    status: reservation.status === "PENDING" ? "Menunggu" : reservation.status,
  };
}

export default function PetugasPage() {
  const [user, setUser] = useState<ApiPayload<never>["user"]>(null);
  const [reservationQueue, setReservationQueue] = useState<
    ReservationQueueItem[]
  >([]);
  const [maintenanceFacilityCount, setMaintenanceFacilityCount] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportQueue, setReportQueue] = useState<ReportQueueItem[]>([]);
  const [pendingReportCount, setPendingReportCount] = useState<number | null>(null);
  const [dashboardReportStats, setDashboardReportStats] = useState<DashboardPayload["reports"] | null>(null);
  const [facilityStats, setFacilityStats] = useState<DashboardPayload["facilities"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [authResponse, reservationResponse, dashboardResponse] =
          await Promise.all([
            fetch("/api/auth/me", { cache: "no-store" }),
            fetch("/api/petugas/reservations?status=PENDING", {
              cache: "no-store",
            }),
            fetch("/api/petugas/dashboard", { cache: "no-store" }),
          ]);

        const [authPayload, reservationPayload, dashboardPayload] =
          await Promise.all([
            authResponse.json().catch(() => null) as Promise<
              ApiPayload<never>
            >,
            reservationResponse.json().catch(() => null) as Promise<
              ApiPayload<ApiReservation[]>
            >,
            dashboardResponse.json().catch(() => null) as Promise<
              ApiPayload<DashboardPayload>
            >,
          ]);

        if (cancelled) {
          return;
        }

        if (authResponse.ok) {
          setUser(authPayload?.user || null);
        }

        const errors: string[] = [];

        if (reservationResponse.ok) {
          setReservationQueue(
            (reservationPayload?.data || []).map(mapReservation),
          );
        } else {
          errors.push(
            reservationPayload?.message ||
              "Antrean reservasi gagal dimuat.",
          );
        }

        if (dashboardResponse.ok && dashboardPayload?.data) {
          const reportData = dashboardPayload.data.reports;
          setDashboardReportStats(reportData);
          setFacilityStats(dashboardPayload.data.facilities);
          setPendingReportCount(reportData.pending);
          setReportQueue(
            reportData.queue.map((report) => ({
              id: String(report.id),
              pelapor: report.user.name,
              fasilitas: report.facility.name,
              kategori: report.category,
              tanggal: formatDate(report.createdAt),
              status: report.status,
            })),
          );
          setMaintenanceFacilityCount(dashboardPayload.data.facilities.maintenance);
        } else {
          setMaintenanceFacilityCount(null);
          setPendingReportCount(null);
          setReportQueue([]);
          errors.push(dashboardPayload?.message || "Ringkasan dashboard gagal dimuat.");
        }

        setErrorMessage(errors.join(" "));
      } catch {
        if (!cancelled) {
          setErrorMessage("Dashboard gagal memuat data dari backend.");
          setMaintenanceFacilityCount(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const summaryCards = [
    {
      title: "Reservasi Menunggu",
      value: isLoading ? "..." : reservationQueue.length,
      description: "Antrian reservasi yang perlu diproses",
      icon: CalendarClock,
      iconClassName: "bg-emerald-50 text-[#006B45]",
    },
    {
      title: "Laporan Menunggu",
      value: isLoading ? "..." : pendingReportCount ?? "—",
      description: "Laporan fasilitas yang perlu ditinjau",
      icon: ClipboardList,
      iconClassName: "bg-amber-50 text-amber-700",
    },
    {
      title: "Dalam Perbaikan",
      value: isLoading ? "..." : maintenanceFacilityCount ?? "—",
      description:
        maintenanceFacilityCount === null
          ? "Data fasilitas gagal dimuat"
          : "Fasilitas yang sedang ditangani",
      icon: Wrench,
      iconClassName: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <>
      <Sidebar
        role="petugas"
        activeMenu="Dashboard"
        user={{
          name: user?.name || "",
          email: user?.email || "",
          role: user?.role || "",
          jenisUser: user?.jenisUser || null,
          identifier: user?.identifier || null,
        }}
      />

      <main className="ml-[230px] min-h-screen bg-[#f4f3ff] px-7 pb-10 pt-[98px] text-[#172033]">
        <PetugasTopbar name={user?.name} />

        <section className="mx-auto max-w-[1120px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Dashboard Petugas
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                Visualisasi tren penggunaan ruang, grafik kerusakan fasilitas,
                dan distribusi statistik operasional.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 self-start rounded-lg bg-[#e8eaff] px-3 py-2 text-xs font-semibold text-[#324077] md:self-auto">
              <ArrowUpRight size={14} /> Export PDF
            </button>
          </div>

          <section className="mt-7 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_4px_18px_rgba(36,48,90,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#172033]">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClassName}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
          </section>

        {errorMessage && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <QueuePanel
            title="Antrian Reservasi"
            description="Daftar reservasi pending dari backend yang perlu diproses."
            emptyTitle="Belum ada reservasi menunggu"
            emptyDescription="Semua reservasi yang masuk sudah diproses."
            isEmpty={reservationQueue.length === 0}
            isLoading={isLoading}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pemohon</th>
                  <th className="px-4 py-3 font-semibold">Fasilitas</th>
                  <th className="px-4 py-3 font-semibold">Jadwal</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {reservationQueue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.pemohon}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.fasilitas}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.tanggal}, {item.waktu}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge>{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </QueuePanel>

          <QueuePanel
            title="Antrian Laporan"
            description="Laporan pending dan dalam perbaikan dari database."
            emptyTitle="Belum ada laporan menunggu"
            emptyDescription="Semua laporan yang masuk sudah diproses."
            isEmpty={reportQueue.length === 0}
            isLoading={isLoading}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pelapor</th>
                  <th className="px-4 py-3 font-semibold">Fasilitas</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {reportQueue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.pelapor}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.fasilitas}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.kategori}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge>{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </QueuePanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <DashboardInsight title="Distribusi Status Laporan Kerusakan" icon={<PieChart size={16} />}>
            <div className="flex items-center gap-6 py-5">
              <div className="hidden flex h-28 w-28 items-center justify-center rounded-full border-[18px] border-[#08764f] text-center">
                <div><strong className="block text-2xl">—</strong><span className="text-[9px] text-slate-400">TOTAL</span></div>
              </div>
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[18px] border-[#08764f] text-center">
                <div><strong className="block text-2xl">{dashboardReportStats?.total ?? "—"}</strong><span className="text-[9px] text-slate-400">TOTAL</span></div>
              </div>
              <div className="space-y-2 text-xs leading-5 text-slate-500">
                <p>Menunggu: {dashboardReportStats ? `${dashboardReportStats.pending} (${percentage(dashboardReportStats.pending, dashboardReportStats.total)})` : "—"}</p>
                <p>Dalam perbaikan: {dashboardReportStats ? `${dashboardReportStats.inProgress} (${percentage(dashboardReportStats.inProgress, dashboardReportStats.total)})` : "—"}</p>
                <p>Selesai: {dashboardReportStats ? `${dashboardReportStats.resolved} (${percentage(dashboardReportStats.resolved, dashboardReportStats.total)})` : "—"}</p>
              </div>
            </div>
          </DashboardInsight>

          <DashboardInsight title="Kondisi Fasilitas" icon={<Wrench size={16} />}>
            <div className="space-y-4 py-3">
              <MetricBar label="Fasilitas aktif" value={facilityStats ? facilityStats.active : "—"} width={facilityStats ? percentage(facilityStats.active, facilityStats.active + facilityStats.maintenance) : "0%"} />
              <MetricBar label="Dalam perbaikan" value={maintenanceFacilityCount ?? "—"} width={facilityStats ? percentage(facilityStats.maintenance, facilityStats.active + facilityStats.maintenance) : "0%"} />
              <MetricBar label="Menunggu reservasi" value={reservationQueue.length} width={reservationQueue.length ? "100%" : "0%"} />
            </div>
          </DashboardInsight>
        </section>
        </section>
      </main>
    </>
  );
}

function QueuePanel({
  title,
  description,
  emptyTitle,
  emptyDescription,
  isEmpty,
  isLoading,
  children,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  isEmpty: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-[0_4px_18px_rgba(36,48,90,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-[#172033]">{title}</h2>

        <p className="mt-1 text-[10px] text-slate-500">{description}</p>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-xs text-slate-500">
          Memuat data dashboard...
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}

      {!isLoading && isEmpty && (
        <div className="border-t border-slate-100 px-5 py-8">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <AlertTriangle size={22} />
            </div>

            <p className="mt-4 text-xs font-semibold text-[#172033]">
              {emptyTitle}
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              {emptyDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      {children}
    </span>
  );
}

function DashboardInsight({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(36,48,90,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-[#172033]">{title}</h2>
        <span className="text-[#08764f]">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function MetricBar({
  label,
  value,
  width,
}: {
  label: string;
  value: React.ReactNode;
  width: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-600">
        <span>{label}</span>
        <strong className="text-[#172033]">{value}</strong>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-[#08764f]" style={{ width }} />
      </div>
    </div>
  );
}
