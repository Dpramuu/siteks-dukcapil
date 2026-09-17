'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  LayoutTemplate,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Users,
  Menu,
  X,
  Lock,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<'Instagram' | 'TikTok' | 'Twitter'>('Instagram');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const sampleCaptions = {
    Instagram: {
      tag: 'Instagram Feed & Carousel',
      handle: '@dukcapil_resmi',
      badgeColor: 'from-pink-500 via-rose-500 to-amber-500',
      title: '📢 Sosialisasi Aktivasi IKD (Identitas Kependudukan Digital)',
      body: `Halo Warga! Tahukah kamu bahwa kini dokumen kependudukan seperti KTP-el dan Kartu Keluarga sudah bisa diakses langsung melalui genggaman smartphone kamu? 📱✨\n\nYuk segera aktifkan IKD kamu di loket layanan Dukcapil terdekat atau melalui petugas resmi kami. Proses cepat, gratis, dan aman!\n\n#DukcapilBisa #IKD #IdentitasDigital #PelayananAdminduk #DukcapilPrima`,
      metrics: '❤️ 1,248 likes · 💬 84 komentar',
    },
    TikTok: {
      tag: 'TikTok Video Caption',
      handle: '@dukcapil_official',
      badgeColor: 'from-cyan-400 to-rose-500',
      title: '💡 Tips Cepat: Cara Mengurus Akta Kelahiran Bayi Baru Lahir',
      body: `Bunda & Ayah, gak perlu bingung lagi urus Akta Kelahiran si kecil! Cukup siapkan: Surat Keterangan Lahir, Buku Nikah, dan KK. Semua pengurusan GRATIS tanpa calo! 👶📑 Simak video lengkapnya sampai habis ya!\n\n#DukcapilMudah #AktaKelahiran #EdukasiAdminduk #Disdukcapil`,
      metrics: '❤️ 8.5K likes · 💬 312 komentar · 🔁 1.1K share',
    },
    Twitter: {
      tag: 'X (Twitter) Thread',
      handle: '@DukcapilRI',
      badgeColor: 'from-sky-400 to-blue-600',
      title: '🧵 Panduan Penggantian KTP-el yang Rusak atau Hilang',
      body: `Pernah mengalami KTP-el patah, mengelupas, atau hilang? Jangan panik!\n\nBerikut langkah mudah mengajukan cetak ulang KTP-el tanpa perlu surat pengantar RT/RW lagi. Simak utas berikut! 👇\n\n1/3 Siapkan foto KTP rusak atau Surat Kehilangan dari Kepolisian...`,
      metrics: '🔁 429 reposts · ❤️ 1,890 likes · 👁️ 42K tayangan',
    },
  };

  const currentPreview = sampleCaptions[activePlatformTab];

  const features = [
    {
      icon: LayoutTemplate,
      title: "Katalog Template Teks Cerdas",
      desc: "Simpan dan kelompokkan template narasi standar pengurusan KTP-el, KIA, IKD, Akta Kelahiran, hingga Surat Pindah agar komunikasi tetap konsisten.",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: CalendarClock,
      title: "Kalender Penjadwalan Terpusat",
      desc: "Rencanakan publikasi berkala dengan kalender visual interaktif. Atur jam dan tanggal tayang konten pengumuman tanpa ada yang terlewat.",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Layers,
      title: "Multi-Kanal Media Sosial",
      desc: "Kelola distribusi informasi secara serempak untuk Instagram, TikTok, dan Twitter (X) dalam satu antarmuka kerja terpadu.",
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Eye,
      title: "Live Preview Realistis",
      desc: "Simulasikan pratinjau tampilan feed, hashtag, dan format teks persis seperti di aplikasi media sosial sebelum diterbitkan ke publik.",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: BarChart3,
      title: "Monitoring Status Publikasi",
      desc: "Pantau status tiap konten secara jelas mulai dari Draft, Dijadwalkan, hingga Terbit untuk kemudahan pelaporan kinerja tim.",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Aman & Terisolasi",
      desc: "Dilengkapi proteksi akses berbasis akun resmi dengan autentikasi aman untuk menjaga integritas data pengumuman dinas.",
      accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Pilih / Susun Template',
      desc: 'Gunakan template narasi pengumuman resmi yang sudah distandarisasi atau susun caption baru sesuai topik edukasi adminduk.',
    },
    {
      step: '02',
      title: 'Tentukan Target Kanal & Waktu',
      desc: 'Pilih kanal publikasi (Instagram, TikTok, Twitter) dan tentukan tanggal serta jam rilis yang paling optimal bagi warga.',
    },
    {
      step: '03',
      title: 'Periksa via Live Preview',
      desc: 'Cek susunan teks, kerapian baris, dan penempatan hashtag pada simulasi preview feed sebelum jadwal disimpan.',
    },
    {
      step: '04',
      title: 'Pantau Melalui Dashboard',
      desc: 'Lihat agenda harian dan bulanan pada kalender interaktif untuk memastikan publikasi berjalan lancar.',
    },
  ];

  const faqs = [
    {
      q: 'Apa itu platform SITEKS DUKCAPIL?',
      a: 'SITEKS DUKCAPIL (Sistem Informasi Teks & Penjadwalan Konten) adalah aplikasi web resmi yang dirancang khusus untuk mempermudah dinas kependudukan dalam menyusun, menyimpan template informasi pelayanan, serta menjadwalkan publikasi konten media sosial resmi kepada masyarakat secara terstruktur.',
    },
    {
      q: 'Siapa saja yang dapat menggunakan sistem ini?',
      a: 'Sistem ini digunakan oleh tim Hubungan Masyarakat (Humas), administrator media sosial, dan petugas pelayanan Dinas Kependudukan dan Pencatatan Sipil yang berwenang mengelola publikasi informasi layanan administrasi kependudukan.',
    },
    {
      q: 'Media sosial apa saja yang didukung oleh SITEKS?',
      a: 'Saat ini SITEKS mendukung pengelolaan konten dan simulasi pratinjau untuk tiga platform utama: Instagram (Feed & Carousel), TikTok (Caption & Tagar), serta Twitter / X (Utas & Tweet).',
    },
    {
      q: 'Bagaimana cara mengakses dan masuk ke dalam sistem?',
      a: 'Pengguna yang telah memiliki akun terdaftar dapat langsung menekan tombol "Login" atau "Masuk ke Sistem" di halaman ini menggunakan email dinas dan kata sandi yang telah didaftarkan.',
    },
    {
      q: 'Apakah saya bisa menjadwalkan pengumuman mendesak atau darurat?',
      a: 'Tentu. Anda dapat membuat jadwal penayangan instan maupun menjadwalkan pengumuman penting (seperti pemeliharaan server pusat atau layanan keliling jemput bola) beberapa minggu sebelumnya.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600/40 selection:text-white relative overflow-x-hidden">
      
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[35%] -left-32 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[65%] -right-32 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ========================================================
          1. HEADER / NAVBAR
      ======================================================== */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25 group-hover:scale-105 transition-transform">
              <span>S</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg">SI-TEKS</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Dukcapil
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 tracking-tight hidden sm:inline">
                Sistem Informasi Manajemen Teks & Konten
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#hero" className="hover:text-white transition-colors">Beranda</a>
            <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#alur" className="hover:text-white transition-colors">Alur Kerja</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action: Login Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              id="btn-nav-login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/35 hover:-translate-y-0.5 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-blue-200" />
              <span>Login ke Sistem</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 px-5 py-4 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Beranda
            </a>
            <a
              href="#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Tentang
            </a>
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Fitur
            </a>
            <a
              href="#alur"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Alur Kerja
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-zinc-800">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk / Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content (Title, Description, Buttons) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Platform Manajemen Konten Media Sosial Dukcapil</span>
              </div>

              {/* Judul Web */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  SITEKS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">DUKCAPIL</span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-zinc-300 max-w-2xl mx-auto lg:mx-0">
                  Sistem Informasi Teks & Penjadwalan Konten Pelayanan Administrasi Kependudukan
                </p>
              </div>

              {/* Teks Tentang Web */}
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kelola komunikasi publik Dinas Kependudukan dan Pencatatan Sipil secara cerdas dan efisien. 
                SITEKS hadir sebagai solusi terpadu untuk menyusun template teks edukasi adminduk, 
                memeriksa simulasi tampilan konten, dan menjadwalkan penayangan di berbagai kanal media sosial 
                resmi (Instagram, TikTok, & Twitter) secara terencana dan konsisten.
              </p>

              {/* Tombol Login dan Selengkapnya */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/login"
                  id="btn-hero-login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5"
                >
                  <span>Login ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#tentang"
                  id="btn-hero-selengkapnya"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-200 hover:text-white font-medium text-sm sm:text-base transition-all hover:-translate-y-0.5"
                >
                  <span>Selengkapnya</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </a>
              </div>

              {/* Quick Feature Highlights */}
              <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Template Siap Pakai</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Jadwal Multi-Platform</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live Feed Preview</span>
                </div>
              </div>

            </div>

            {/* Right Interactive Mockup Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border border-zinc-700/60 p-5 sm:p-6 shadow-2xl shadow-black/60">
                
                {/* Showcase Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Jadwal Terbit: Besok, 09:00</span>
                  </div>
                </div>

                {/* Platform Selector Tabs */}
                <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                  {(['Instagram', 'TikTok', 'Twitter'] as const).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setActivePlatformTab(platform)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        activePlatformTab === platform
                          ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {platform === 'Twitter' ? 'X / Twitter' : platform}
                    </button>
                  ))}
                </div>

                {/* Live Card Preview Box */}
                <div className="mt-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
                        DK
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-white">Disdukcapil Prima</span>
                          <span className="text-blue-400 text-[10px]">✓</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{currentPreview.handle}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Terjadwal
                    </span>
                  </div>

                  {/* Title & Preview Text */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-blue-300">
                      {currentPreview.title}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60 font-mono text-[11px] max-h-36 overflow-y-auto">
                      {currentPreview.body}
                    </p>
                  </div>

                  {/* Social Metrics preview */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{currentPreview.metrics}</span>
                    <span className="text-blue-400 font-medium text-[10px]">Simulasi Feed</span>
                  </div>

                </div>

                {/* Mini Status Card Footer */}
                <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Sinkronisasi otomatis aktif</span>
                  </div>
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                    <span>Atur Konten</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          3. TENTANG SITEKS DUKCAPIL SECTION
      ======================================================== */}
      <section id="tentang" className="py-20 bg-zinc-900/40 border-y border-zinc-800/60 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Tentang Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Standardisasi Informasi & Publikasi Layanan Adminduk
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Masyarakat membutuhkan kepastian informasi mengenai syarat dan prosedur pengurusan dokumen kependudukan. 
              SITEKS DUKCAPIL hadir sebagai garda terdepan untuk memastikan setiap narasi yang dipublikasikan ke media sosial 
              akurat, terstandardisasi, dan tersampaikan tepat waktu.
            </p>
          </div>

          {/* 3 Pilar Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Konsistensi Pesan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Mencegah kekeliruan narasi persyaratan layanan kependudukan. Format teks mengacu pada pedoman standar Dukcapil yang valid dan seragam.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manajemen Waktu</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Memudahkan staf dalam menyusun kalender redaksi mingguan maupun bulanan. Tidak ada lagi konten mendadak yang tertunda atau terlewat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Jangkauan Warga Luas</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Menyasar seluruh kelompok usia masyarakat melalui konten yang disesuaikan karakternya untuk audiens Instagram, video TikTok, dan utas X.
              </p>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">3+</p>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Platform Terpadu</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Konsistensi Informasi</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">Real-time</p>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Live Feed Preview</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">24/7</p>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Kesiapan Penjadwalan</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          4. FITUR UTAMA SECTION
      ======================================================== */}
      <section id="fitur" className="py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Fitur Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Semua yang Dibutuhkan Humas Dukcapil
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Dirancang dengan antarmuka yang intuitif dan fungsional agar proses perencanaan publikasi konten dapat diselesaikan dalam hitungan menit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-blue-600/5 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${feat.accent}`}>
                    <IconComp className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          5. ALUR KERJA (CARA KERJA) SECTION
      ======================================================== */}
      <section id="alur" className="py-20 bg-zinc-900/40 border-y border-zinc-800/60 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Alur Kerja
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Langkah Mudah Menjadwalkan Konten
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Hanya dengan 4 langkah praktis, konten edukasi dan pengumuman resmi siap menyapa warga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 transition-all space-y-3"
              >
                <span className="text-3xl font-black text-zinc-700 tracking-tight font-mono">
                  {step.step}
                </span>
                <h3 className="text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          6. FAQ SECTION
      ======================================================== */}
      <section id="faq" className="py-20 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-zinc-400">
              Temukan jawaban cepat seputar fungsionalitas dan operasional platform SITEKS Dukcapil.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-medium text-white hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          7. CALL TO ACTION BANNER
      ======================================================== */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/50 via-zinc-900 to-indigo-950/50 border border-blue-500/30 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Siap Meningkatkan Kualitas Informasi Publik Dukcapil?
              </h2>
              <p className="text-sm sm:text-base text-zinc-300">
                Masuk ke akun petugas Anda untuk mulai membuat jadwal postingan, menyimpan template teks, dan mengelola kalender konten hari ini.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  id="btn-cta-login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login ke Dashboard</span>
                </Link>
                <a
                  href="#hero"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-sm transition-all"
                >
                  Kembali ke Atas
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER
      ======================================================== */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">SITEKS DUKCAPIL</p>
                <p className="text-[11px] text-zinc-500">Sistem Informasi Teks & Penjadwalan Konten</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
              <a href="#hero" className="hover:text-white transition-colors">Beranda</a>
              <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>
              <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
              <a href="#alur" className="hover:text-white transition-colors">Alur</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Masuk / Login
              </Link>
            </div>

            <p className="text-center md:text-right">
              &copy; {new Date().getFullYear()} Dinas Kependudukan dan Pencatatan Sipil. All rights reserved.
            </p>

          </div>
        </div>
      </footer>

    </div>
  );
}
