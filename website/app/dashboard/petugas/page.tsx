import Sidebar from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Wrench,
} from "lucide-react";

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

export default async function PetugasPage() {
  const user: any = await getCurrentUser();

  const reservationQueue: ReservationQueueItem[] = [];
  const reportQueue: ReportQueueItem[] = [];
  const maintenanceFacilityCount = 0;

  const summaryCards = [
    {
      title: "Reservasi Menunggu",
      value: reservationQueue.length,
      description: "Antrian reservasi yang perlu diproses",
      icon: CalendarClock,
      iconClassName: "bg-emerald-50 text-[#006B45]",
    },
    {
      title: "Laporan Menunggu",
      value: reportQueue.length,
      description: "Laporan fasilitas yang perlu ditinjau",
      icon: ClipboardList,
      iconClassName: "bg-amber-50 text-amber-700",
    },
    {
      title: "Dalam Perbaikan",
      value: maintenanceFacilityCount,
      description: "Fasilitas yang sedang ditangani",
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

      <main className="ml-[230px] min-h-screen bg-[#f7f9fc] px-8 py-7 text-gray-900">
        <section className="mb-8">
          <p className="text-sm font-medium text-[#006B45]">
            Portal Operasional
          </p>

          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Petugas</h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Pantau antrian reservasi dan laporan yang menunggu diproses.
              </p>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold text-[#006B45]">
                {user?.name || "Petugas"}
              </span>
              <span className="ml-2 text-gray-400">PETUGAS</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      {card.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconClassName}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <QueuePanel
            title="Antrian Reservasi"
            description="Daftar reservasi pending akan ditampilkan di sini setelah model reservasi tersedia."
            emptyTitle="Belum ada reservasi menunggu"
            emptyDescription="Data reservasi akan terhubung setelah modul reservasi dan model domain tersedia."
            isEmpty={reservationQueue.length === 0}
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
            description="Daftar laporan baru atau menunggu tindak lanjut akan ditampilkan di sini."
            emptyTitle="Belum ada laporan menunggu"
            emptyDescription="Data laporan akan terhubung setelah modul laporan dan model domain tersedia."
            isEmpty={reportQueue.length === 0}
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
  children,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="overflow-x-auto">{children}</div>

      {isEmpty && (
        <div className="border-t border-gray-100 px-5 py-8">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <AlertTriangle size={22} />
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-900">
              {emptyTitle}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
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
