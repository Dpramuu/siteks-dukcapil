'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Bolt, CalendarClock, LayoutTemplate, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    });

    if (authError) {
      // Terjemahkan pesan error Supabase ke bahasa Indonesia
      if (authError.message === 'Invalid login credentials') {
        setError('Email atau password salah. Coba lagi.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek inbox kamu.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // Login berhasil — middleware akan handle redirect kalau ada ?redirectTo
    // Default redirect ke dashboard
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirectTo') ?? '/dashboard';
    router.push(redirectTo);
    router.refresh(); // refresh supaya layout server re-fetch session
  };

  return (
    <div className="flex min-h-screen">

      {/* Kiri — Visual */}
      <div className="hidden lg:flex w-[45%] bg-[#185FA5] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute w-87.5 h-87.5 rounded-full border border-white/10 -top-20 -left-20" />
        <div className="absolute w-70 h-70 rounded-full border border-white/10 -bottom-16 -right-16" />

        <div className="relative z-10 text-center mb-10">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
            <Bolt className="text-white w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">SI-TEKS</h1>
          <p className="text-sm text-white/60 mt-2 max-w-50 mx-auto leading-relaxed">
            Platform penjadwalan konten media sosial serba bisa
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full max-w-65">
          {[
            { icon: CalendarClock,  title: 'Jadwal Konten',       sub: 'Atur posting otomatis setiap hari' },
            { icon: LayoutTemplate, title: 'Template Caption',   sub: 'Hemat waktu dengan template siap pakai' },
            { icon: BarChart3,      title: 'Dashboard Analitik', sub: 'Pantau performa konten kamu' },
          ].map((f) => {
            const IconComponent = f.icon;
            return (
              <div key={f.title} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <IconComponent className="text-white w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{f.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{f.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">

          {/* Tab switcher */}
          <div className="flex gap-0 bg-zinc-100 rounded-xl p-1 mb-8">
            <span className="flex-1 text-center py-2 text-sm font-medium text-zinc-900 bg-white rounded-lg shadow-sm">
              Masuk
            </span>
            <Link href="/register" className="flex-1 text-center py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors rounded-lg">
              Daftar
            </Link>
          </div>

          <h2 className="text-xl font-medium text-zinc-900 mb-1">Selamat datang</h2>
          <p className="text-sm text-zinc-500 mb-6">Masuk ke akun SI-TEKS kamu</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                placeholder="nama@email.com" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-5">
            Belum punya akun?{' '}
            <Link href="/register" className="text-[#185FA5] font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}