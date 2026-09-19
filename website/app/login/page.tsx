"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          identifier,

          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal");

        setLoading(false);

        return;
      }

      console.log("LOGIN RESPONSE:", data);

      const role = data.user.role;

      console.log("ROLE:", role);

      if (role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (role === "PETUGAS") {
        router.push("/dashboard/petugas");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/bg.svg"
          alt="background"
          fill
          className="object-cover blur-[1px]"
          priority
        />

        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[470px] rounded-2xl bg-white px-10 py-12 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="SIKAK" width={190} height={70} priority />
        </div>

        <div className="my-8 border-t border-gray-200" />

        <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h1>

        <p className="mt-2 text-sm text-gray-500">
          Silakan login untuk melanjutkan ke sistem.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Email atau NIM/NIP
            </label>

            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="contoh@kampus.ac.id / NIM / NIP"
              className="
                w-full rounded-lg border border-gray-200
                bg-gray-50 px-4 py-3
                text-sm text-gray-700
                outline-none
                focus:border-green-600
              "
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="
                  w-full rounded-lg border border-gray-200
                  bg-gray-50 px-4 py-3 pr-12
                  text-sm text-gray-700
                  outline-none
                  focus:border-green-600
                "
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-gray-500
                "
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                defaultChecked
                className="accent-green-600"
              />
              Ingat saya
            </label>

            <a href="#" className="text-sm font-semibold text-[#0D7C55]">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              mt-3 w-full rounded-lg
              bg-[#0D7C55] py-3
              font-semibold text-white
              transition
              hover:bg-green-800
              disabled:bg-gray-400
            "
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>


        <p className="mt-8 text-center text-sm text-gray-500">
          Belum punya akun?
          <a href="/register" className="ml-1 font-semibold text-[#0D7C55]">
            Daftar sekarang
          </a>
        </p>
      </div>
    </main>
  );
}
