'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  };

  return (
    <div className="flex min-h-screen">

      {/* Kiri — Visual (sama dengan login) */}
      <div className="hidden lg:flex w-[45%] bg-[#185FA5] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute w-87.5 h-87.5 rounded-full border border-white/10 -top-20 -left-20" />
        <div className="absolute w-70 h-70 rounded-full border border-white/10 -bottom-16 -right-16" />

        <div className="relative z-10 text-center mb-10">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <i className="ti ti-bolt text-white text-2xl" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">SI-TEKS</h1>
          <p className="text-sm text-white/60 mt-2 max-w-65 mx-auto leading-relaxed">
            Platform penjadwalan konten media sosial serba bisa
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full max-w-65">
          {[
            { icon: 'ti-calendar',  title: 'Jadwal Konten',      sub: 'Atur posting otomatis setiap hari' },
            { icon: 'ti-file-text', title: 'Template Caption',   sub: 'Hemat waktu dengan template siap pakai' },
            { icon: 'ti-chart-bar', title: 'Dashboard Analitik', sub: 'Pantau performa konten kamu' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                <i className={`ti ${f.icon} text-white text-sm`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">{f.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">

          {/* Tab switcher */}
          <div className="flex gap-0 bg-zinc-100 rounded-xl p-1 mb-8">
            <Link href="/login" className="flex-1 text-center py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors rounded-lg">
              Masuk
            </Link>
            <span className="flex-1 text-center py-2 text-sm font-medium text-zinc-900 bg-white rounded-lg shadow-sm">
              Daftar
            </span>
          </div>

          <h2 className="text-xl font-medium text-zinc-900 mb-1">Buat akun baru</h2>
          <p className="text-sm text-zinc-500 mb-6">Daftar dan mulai kelola kontenmu</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                placeholder="username kamu" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                placeholder="nama@email.com" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                placeholder="Minimal 6 karakter" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#185FA5] font-medium hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}