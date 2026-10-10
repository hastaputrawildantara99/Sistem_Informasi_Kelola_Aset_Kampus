"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  FileText,
  Settings,
  CalendarDays,
  Wrench,
  UserCircle,
  MoreVertical,
} from "lucide-react";

type SidebarProps = {
  role?: "admin" | "petugas";
  activeMenu?: string;

  user?: {
    name: string;
    email: string;
    role: string;
    jenisUser?: string | null;
    identifier?: string | null;
  };
};

export default function Sidebar({
  role = "admin",
  activeMenu,
  user,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");

    router.refresh();
  }

  const adminMenu = [
    {
      name: "Dashboard Overview",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
    },
    {
      name: "Manajemen Akun",
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      name: "Kelola Fasilitas",
      icon: Building2,
      href: "/dashboard/admin/fasilitas",
    },
    {
      name: "Verifikasi Registrasi",
      icon: ClipboardCheck,
      href: "/dashboard/admin/verifikasi",
    },
    {
      name: "Rekap & Laporan",
      icon: FileText,
      href: "/dashboard/admin/rekap",
    },
    {
      name: "Pengaturan",
      icon: Settings,
      href: "/dashboard/admin/settings",
    },
  ];

  const petugasMenu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/petugas",
    },
    {
      name: "Kelola Reservasi",
      icon: CalendarDays,
      href: "/dashboard/petugas/reservasi",
    },
    {
      name: "Laporan & Fasilitas",
      icon: Wrench,
      href: "/dashboard/petugas/laporan",
    },
    {
      name: "Pengaturan",
      icon: Settings,
      href: "/dashboard/petugas/settings",
    },
  ];

  const menus = role === "admin" ? adminMenu : petugasMenu;

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        flex
        h-screen
        w-[230px]
        flex-col
        bg-[#006B45]
        px-4
        py-5
        text-white
      "
    >
      {/* BRAND */}


      <div className="px-2">
        <Link href="/">
          <Image
            src="/sikak-logo-putih.png"
            alt="SIKAK"
            width={170}
            height={52}
            className="h-auto w-[170px]"
            priority
          />
        </Link>

        <h1 className="sr-only text-2xl font-bold tracking-wide">
          SIKAK
        </h1>

        <p className="mt-1 text-[11px] uppercase text-green-100">
          {role === "admin" ? "Admin Portal" : "Portal Operasional"}
        </p>

      </div>

      {/* MENU TITLE */}

      <p
        className="
        mt-10
        px-2
        text-[11px]
        font-medium
        uppercase
        text-green-100/70
        "
      >
        {role === "admin" ? "Menu Utama" : "Menu Operasional"}
      </p>

      {/* MENU LIST */}

      <nav
        className="
        mt-4
        flex-1
        space-y-2
        "
      >
        {menus.map((item) => {
          const Icon = item.icon;

          // Check active based on pathname or activeMenu fallback
          const active = pathname
            ? (item.href === "/dashboard/admin" || item.href === "/dashboard/petugas"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/") || (item.href === "/dashboard/admin/users" && pathname.startsWith("/dashboard/admin/user")))
            : activeMenu === item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  transition

                  ${
                    active
                      ? "bg-white text-[#006B45] font-semibold"
                      : "text-green-50 hover:bg-white/10"
                  }

                `}
            >
              <Icon size={18} />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER CARD */}

      <div
        className="
    rounded-xl
    bg-white/10
    p-3
  "
      >
        <div className="flex items-start gap-3">
          <div
            className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-green-200
        text-green-800
        font-bold
      "
          >
            {user?.name?.slice(0, 2).toUpperCase() || "US"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">
              {user?.name || "User"}
            </p>

            <div className="mt-0.5">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-800 text-emerald-100 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'ADMINISTRATOR' : (user?.role === 'PETUGAS' ? 'PETUGAS' : (user?.jenisUser || 'PENGGUNA'))}
              </span>
            </div>

            {user?.email && (
              <p className="mt-1 text-[11px] text-green-100/80 truncate">
                {user.email}
              </p>
            )}

            {user?.identifier && (
              <p className="text-[11px] text-green-100/80 truncate">
                {user?.role === 'ADMIN' ? `ID: ${user.identifier}` : `${user?.jenisUser ? user.jenisUser.charAt(0) + user.jenisUser.slice(1).toLowerCase() : 'NIM/NIP'}: ${user.identifier}`}
              </p>
            )}

            <button
              onClick={handleLogout}
              className="mt-2 text-xs text-red-200 hover:text-white transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
