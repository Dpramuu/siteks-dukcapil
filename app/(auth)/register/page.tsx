"use client";

import { useState } from "react";
import Link from "next/link";

import { Bolt, CalendarClock, LayoutTemplate, BarChart3 } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registrasi gagal.");
        setLoading(false);
        return;
      }

      setSuccess("Pendaftaran berhasil! Mengarahkan ke dashboard...");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");

      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Kiri — Visual */}
      <div className="hidden lg:flex w-[45%] bg-zinc-900 border-r border-zinc-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full border border-zinc-800 -top-20 -left-20" />

        <div className="absolute w-80 h-80 rounded-full border border-zinc-800 -bottom-16 -right-16" />

        <div className="relative z-10 text-center mb-10">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Bolt className="text-blue-400 w-6 h-6" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-medium text-white tracking-tight">
            SI-TEKS
          </h1>

          <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Platform penjadwalan konten media sosial serba bisa
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
          {[
            {
              icon: CalendarClock,
              title: "Jadwal Konten",
              sub: "Atur posting otomatis setiap hari",
            },
            {
              icon: LayoutTemplate,
              title: "Template Caption",
              sub: "Hemat waktu dengan template siap pakai",
            },
            {
              icon: BarChart3,
              title: "Dashboard Analitik",
              sub: "Pantau performa konten kamu",
            },
          ].map((f) => {
            const IconComponent = f.icon;

            return (
              <div
                key={f.title}
                className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                  <IconComponent
                    className="text-blue-400 w-4 h-4"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>

                  <p className="text-xs text-zinc-500 mt-0.5">{f.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8">
            <Link
              href="/login"
              className="flex-1 text-center py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg"
            >
              Masuk
            </Link>

            <span className="flex-1 text-center py-2 text-sm font-medium text-white bg-zinc-700 rounded-lg">
              Daftar
            </span>
          </div>

          <h2 className="text-xl font-medium text-white mb-1">
            Buat akun baru
          </h2>

          <p className="text-sm text-zinc-500 mb-6">
            Daftar dan mulai kelola kontenmu
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-950/50 border border-red-900 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-950/50 border border-emerald-900 px-3 py-2.5 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="username kamu"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="nama@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Minimal 6 karakter"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-5">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
