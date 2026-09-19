"use client";

import Image from "next/image";
import { Eye, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jenisUser, setJenisUser] = useState("MAHASISWA");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          jenisUser,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registrasi berhasil");
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setMessage(data.message || "Registrasi gagal");
      }
    } catch {
      setMessage("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-[#f7f9fc]">
      {/* LEFT SIDE */}
      <section
        className="
          hidden lg:flex
          relative
          w-[38%]
          min-h-screen
          overflow-hidden
          bg-green-700
          px-16
          py-12
          text-white
          flex-col
        "
      >
        {/* Background */}
        <Image
          src="/background.jpg"
          alt="background"
          fill
          className="object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-[#0D7C55]/92" />

        <div className="relative z-10">
          {/* Logo */}
          <Image src="/logo2.svg" width={250} height={80} alt="SIKAK" />

          <h1
            className="
              mt-10
              text-4xl
              font-bold
              leading-tight
            "
          >
            Satu Portal untuk
            <br />
            Seluruh Fasilitas
            <br />
            Kampus
          </h1>

          <p
            className="
              mt-8
              max-w-md
              text-lg
              leading-relaxed
              text-green-50
            "
          >
            Dapatkan kemudahan akses peminjaman fasilitas dan infrastruktur
            dalam satu genggaman tangan Anda.
          </p>

          {/* Feature */}
          <div className="mt-16 space-y-8">
            <Feature
              title="Reservasi Cepat & Transparan"
              desc="Cek jadwal ketersediaan ruangan secara real-time langsung dari sistem."
            />

            <Feature
              title="Pelaporan Kendala Terintegrasi"
              desc="Laporkan kerusakan fasilitas fisik dengan foto untuk penanganan cepat."
            />

            <Feature
              title="Verifikasi Civitas Akademika"
              desc="Keamanan terjamin menggunakan NIM/NIP yang divalidasi sistem kampus."
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            absolute
            bottom-8
            left-16
            right-16
            border-t
            border-white/20
            pt-5
            text-sm
            text-green-100
          "
        >
          © 2026 Sikak
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section
        className="
          flex
          flex-1
          items-center
          justify-center
          p-6
        "
      >
        <div
          className="
            w-full
            max-w-[590px]
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-10
            py-8
            shadow-sm
          "
        >
          <h2
            className="
              text-3xl
              font-bold
              text-gray-900
            "
          >
            Buat Akun Baru
          </h2>

          <p className="mt-2 text-gray-500">
            Lengkapi data diri Anda untuk mengakses layanan fasilitas kampus.
          </p>

          <div className="my-7 border-t" />

          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={setName}
            />

            <Input
              label="NIM / NIP"
              placeholder="Contoh: 24060124120039"
              helper="Digunakan untuk verifikasi civitas akademika"
              value={username}
              onChange={setUsername}
            />

            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-gray-800">
                Peran / Civitas
              </label>

              <div
                className="
    mt-2
    grid
    grid-cols-3
    rounded-lg
    bg-gray-100
    p-1
  "
              >
                <button
                  type="button"
                  onClick={() => setJenisUser("MAHASISWA")}
                  className={`
      rounded-md
      py-2
      text-sm
      font-semibold
      transition
      ${
        jenisUser === "MAHASISWA"
          ? "bg-white text-[#0D7C55] shadow-sm"
          : "text-gray-500"
      }
    `}
                >
                  Mahasiswa
                </button>

                <button
                  type="button"
                  onClick={() => setJenisUser("DOSEN")}
                  className={`
      rounded-md
      py-2
      text-sm
      font-semibold
      transition
      ${
        jenisUser === "DOSEN"
          ? "bg-white text-[#0D7C55] shadow-sm"
          : "text-gray-500"
      }
    `}
                >
                  Dosen
                </button>

                <button
                  type="button"
                  onClick={() => setJenisUser("STAF")}
                  className={`
      rounded-md
      py-2
      text-sm
      font-semibold
      transition
      ${
        jenisUser === "STAF"
          ? "bg-white text-[#0D7C55] shadow-sm"
          : "text-gray-500"
      }
    `}
                >
                  Staf / Petugas
                </button>
              </div>
            </div>

            <Input
              label="Email Kampus"
              placeholder="nama@students.undip.ac.id"
              value={email}
              onChange={setEmail}
            />

            <div className="grid grid-cols-2 gap-4">
              <PasswordInput
                label="Password"
                placeholder="Min. 8 karakter"
                value={password}
                onChange={setPassword}
              />

              <Input
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>

            <label className="flex gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                className="accent-green-700"
                defaultChecked
              />

              <span>
                Saya menyetujui
                <span className="font-semibold text-[#0D7C55]">
                  {" "}
                  Syarat & Ketentuan Penggunaan Layanan Fasilitas Kampus
                </span>
              </span>
            </label>

            {message && <p className="text-sm text-[#0D7C55]">{message}</p>}

            <button
              type="submit"
              className="
                w-full
                rounded-lg
                bg-[#0D7C55]
                py-3
                font-semibold
                text-white
                hover:bg-[#0F734F]
              "
            >
              Daftar Akun
            </button>

            <p className="pt-4 text-center text-sm text-gray-500">
              Sudah punya akun?
              <a className="ml-2 font-semibold text-[#0D7C55]" href="/login">
                Masuk sekarang
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  placeholder,
  helper,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  helper?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-800">{label}</label>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          mt-2
          w-full
          rounded-lg
          border
          border-gray-200
          bg-gray-50
          px-4
          py-3
          outline-none
          focus:border-green-700
        "
      />

      {helper && <p className="mt-2 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>

      <div className="relative">
        <input
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="
            mt-2
            w-full
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            px-4
            py-3
            pr-10
          "
        />

        <Eye
          size={18}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-gray-500
          "
        />
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="
flex
h-7
w-7
items-center
justify-center
rounded-full
bg-white/20
"
      >
        <Check size={18} />
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-sm text-green-100">{desc}</p>
      </div>
    </div>
  );
}
