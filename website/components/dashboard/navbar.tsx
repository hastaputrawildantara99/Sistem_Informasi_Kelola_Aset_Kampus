"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, LogIn, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type NavbarProps = {
  user?: {
    name: string;
    email: string;
    role: string;
    jenisUser?: string | null;
    identifier?: string | null;
  };
};

export default function Navbar({ user: currentUser }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");

    router.refresh();
  }

  function formatText(text?: string | null) {
    if (!text) return "";

    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return (
    <header
      className="
        fixed
        top-0
        left-0
        z-50
        w-full
        border-b
        border-gray-100
        bg-white
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[64px]
          max-w-[1200px]
          items-center
          justify-between
          px-6
        "
      >
        {/* LOGO */}

        <Link href="/">
          <Image src="/logo.svg" alt="SIKAK" width={115} height={40} priority />
        </Link>

        {/* CENTER MENU */}

        <nav
          className="
            hidden
            md:flex
            items-center
            gap-1
            rounded-full
            bg-[#f1f3fb]
            p-1
          "
        >
          <MenuItem active>Katalog Fasilitas</MenuItem>

          <MenuItem>Reservasi</MenuItem>

          <MenuItem>Laporan Kerusakan</MenuItem>

          <MenuItem>Bantuan</MenuItem>
        </nav>

        {/* RIGHT SECTION */}

        {currentUser ? (
          // USER LOGIN

          <div
            className="
                flex
                items-center
                gap-5
              "
          >
            <button
              className="
                  relative
                  text-gray-600
                "
            >
              <Bell size={20} />

              <span
                className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    text-[10px]
                    text-white
                  "
              >
                3
              </span>
            </button>

            <div
              className="
                  flex
                  items-center
                  gap-2
                "
            >
              <UserCircle size={34} className="text-green-700" />

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">
                  {currentUser?.name ?? "User"}
                </p>

                <p className="text-xs text-gray-500">
                  {formatText(currentUser?.jenisUser)
                    ? formatText(currentUser?.jenisUser)
                    : formatText(currentUser?.role)}

                  {currentUser?.identifier && (
                    <>{" • " + currentUser.identifier}</>
                  )}
                </p>

                <p className="text-[11px] text-gray-400">
                  {currentUser?.email}
                </p>

                <button
                  onClick={handleLogout}
                  className="
      mt-1
      text-xs
      text-red-600
      hover:text-red-800
    "
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          // BELUM LOGIN

          <div
            className="
                flex
                items-center
                gap-4
              "
          >
            <Link
              href="/register"
              className="
                  hidden
                  sm:block
                  text-sm
                  font-medium
                  text-gray-700
                "
            >
              Registrasi Akun
            </Link>

            <Link
              href="/login"
              className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-[#007A4D]
                  px-5
                  py-2
                  text-sm
                  font-semibold
                  text-white
                "
            >
              <LogIn size={16} />
              Masuk
            </Link>

            <UserCircle
              size={30}
              className="
                  text-green-700
                "
            />
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href="#"
      className={`
rounded-full
px-5
py-2
text-sm
font-medium

${active ? "bg-[#007A4D] text-white" : "text-gray-700 hover:bg-white"}

`}
    >
      {children}
    </Link>
  );
}
