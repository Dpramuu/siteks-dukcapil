'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  Eye,
  Layers,
  LayoutTemplate,
  ListChecks,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

import { gsap, prefersReducedMotion } from '@/lib/gsap';
import Reveal from '@/app/components/ui/Reveal';
import Counter from '@/app/components/ui/Counter';
import Modal from '@/app/components/ui/Modal';
import Magnetic from '@/app/components/ui/Magnetic';
import CustomCursor from '@/app/components/ui/CustomCursor';
import ThemeToggle from '@/app/components/ui/ThemeToggle';
import Hero3DMockup from '@/app/components/landing/Hero3DMockup';
import WorkflowCarousel from '@/app/components/landing/WorkflowCarousel';
import SmoothScroll from '@/app/components/layout/SmoothScroll';

/* ------------------------------------------------------------------ data */

const NAV = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#alur', label: 'Alur' },
  { href: '#faq', label: 'FAQ' },
];

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Katalog template teks',
    desc: 'Narasi baku KTP-el, KIA, IKD, akta, hingga surat pindah tersimpan rapi dan siap dipakai ulang.',
    detail: [
      'Kelompokkan template berdasarkan jenis layanan.',
      'Revisi satu kali, berlaku untuk seluruh jadwal berikutnya.',
      'Menjaga istilah dan syarat layanan tetap seragam.',
    ],
  },
  {
    icon: CalendarClock,
    title: 'Kalender penjadwalan',
    desc: 'Rencanakan penayangan harian dan bulanan pada satu kalender kerja tanpa ada agenda yang bentrok.',
    detail: [
      'Tampilan bulanan dan harian dalam satu layar.',
      'Atur tanggal serta jam tayang tiap konten.',
      'Agenda bentrok langsung terlihat sejak awal.',
    ],
  },
  {
    icon: Layers,
    title: 'Multi kanal',
    desc: 'Satu naskah dapat diarahkan ke beberapa kanal media sosial resmi dinas sekaligus.',
    detail: [
      'Pilih kanal tujuan per jadwal.',
      'Panjang teks disesuaikan karakter tiap kanal.',
      'Riwayat distribusi tercatat per kanal.',
    ],
  },
  {
    icon: Eye,
    title: 'Pratinjau naskah',
    desc: 'Periksa kerapian baris, panjang teks, dan penempatan tagar sebelum jadwal dikunci.',
    detail: [
      'Pratinjau teks sesuai batas karakter kanal.',
      'Deteksi baris terlalu panjang atau tagar berulang.',
      'Kurangi revisi setelah konten terbit.',
    ],
  },
  {
    icon: ListChecks,
    title: 'Status publikasi',
    desc: 'Pantau perjalanan tiap konten dari draf, terjadwal, hingga terbit untuk kebutuhan pelaporan.',
    detail: [
      'Tiga status ringkas: draf, terjadwal, terbit.',
      'Rekap mingguan untuk laporan kinerja tim.',
      'Jejak perubahan tiap jadwal tersimpan.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Akses terkontrol',
    desc: 'Hanya akun petugas resmi yang dapat menyusun dan mengubah jadwal publikasi dinas.',
    detail: [
      'Autentikasi akun dinas.',
      'Sesi berakhir otomatis saat tidak aktif.',
      'Data jadwal terpisah dari akses publik.',
    ],
  },
];

const PILLARS = [
  {
    no: '01',
    title: 'Konsistensi pesan',
    desc: 'Satu sumber naskah untuk seluruh kanal, sehingga syarat dan prosedur layanan tidak lagi berbeda antar unggahan.',
  },
  {
    no: '02',
    title: 'Kepastian waktu',
    desc: 'Kalender redaksi tersusun lebih awal. Pengumuman penting tidak lagi bergantung pada ingatan petugas.',
  },
  {
    no: '03',
    title: 'Jangkauan warga',
    desc: 'Naskah disesuaikan karakter tiap kanal agar informasi layanan terbaca oleh kelompok usia yang berbeda.',
  },
];

const FAQS = [
  {
    q: 'Apa itu SITEKS Dukcapil?',
    a: 'Sistem Informasi Teks & Penjadwalan Konten: aplikasi internal untuk menyusun template naskah layanan administrasi kependudukan dan menjadwalkan publikasinya secara terstruktur.',
  },
  {
    q: 'Siapa yang menggunakan sistem ini?',
    a: 'Tim Hubungan Masyarakat, administrator media sosial, dan petugas pelayanan yang berwenang mengelola publikasi informasi layanan adminduk.',
  },
  {
    q: 'Kanal apa saja yang didukung?',
    a: 'Sistem mendukung pengelolaan naskah dan jadwal untuk beberapa kanal media sosial resmi dinas, dengan penyesuaian panjang teks pada masing-masing kanal.',
  },
  {
    q: 'Bagaimana cara masuk ke sistem?',
    a: 'Gunakan tombol Masuk pada halaman ini, lalu isi email dinas dan kata sandi yang telah terdaftar oleh administrator.',
  },
  {
    q: 'Bisakah menjadwalkan pengumuman mendesak?',
    a: 'Bisa. Jadwal dapat dibuat untuk penayangan segera maupun direncanakan beberapa minggu sebelumnya, termasuk pengumuman layanan keliling atau pemeliharaan sistem.',
  },
];

/* ------------------------------------------------- accordion beranimasi */

function Faq({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
      return;
    }
    gsap.to(el, {
      height: open ? 'auto' : 0,
      opacity: open ? 1 : 0,
      duration: 0.55,
      ease: 'expo.out',
    });
  }, [open]);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-base font-medium tracking-tight transition-colors group-hover:text-accent sm:text-lg">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-500 ${
            open ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>
      <div ref={bodyRef} className="h-0 overflow-hidden opacity-0">
        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">{a}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- halaman */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* indikator progres scroll + parallax judul hero */
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: { start: 0, end: () => document.body.scrollHeight, scrub: 0.3 },
          },
        );
      }

      if (heroTextRef.current) {
        /* fade in + slide berurutan saat halaman dibuka */
        gsap.fromTo(
          heroTextRef.current.querySelectorAll('[data-hero-item]'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' },
        );

        /* parallax halus saat scroll */
        gsap.to(heroTextRef.current, {
          yPercent: 12,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: heroTextRef.current,
            start: 'top top+=120',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  /* animasi menu mobile */
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (menuOpen) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'expo.out' },
      );
      gsap.fromTo(
        el.querySelectorAll('[data-menu-item]'),
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.05, delay: 0.1 },
      );
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
    }
  }, [menuOpen]);

  const feature = activeFeature !== null ? FEATURES[activeFeature] : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg font-sans text-ink">
      <CustomCursor />

      {/* ============================= NAVBAR ============================= */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent"
        />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">Siteks</span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
              Dukcapil
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-sweep text-[13px] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Magnetic strength={0.2}>
              <Link
                href="/login"
                className="press group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[13px] font-medium text-bg hover:border-accent hover:bg-accent"
              >
                Masuk
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link
              href="/login"
              className="press rounded-full border border-ink bg-ink px-4 py-2 text-xs font-medium text-bg"
            >
              Masuk
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="press flex h-9 w-9 items-center justify-center rounded-full border border-line"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* menu mobile — slide */}
        <div ref={menuRef} className="h-0 overflow-hidden border-t border-line md:hidden">
          <div className="space-y-1 px-5 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-menu-item
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-ink-soft"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <SmoothScroll className="pt-16">
        {/* ============================== HERO ============================== */}
        <section id="beranda" className="relative scroll-mt-16">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
            <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
              {/* teks */}
              <div ref={heroTextRef} className="lg:col-span-6">
                <p data-hero-item className="eyebrow">
                  Sistem Informasi Internal
                </p>

                <h1
                  data-hero-item
                  className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
                >
                  Naskah layanan,
                  <br />
                  <span className="text-muted">terjadwal rapi.</span>
                </h1>

                <p data-hero-item className="mt-7 max-w-md text-[15px] leading-relaxed text-muted">
                  SITEKS membantu tim Dukcapil menyusun template naskah layanan administrasi
                  kependudukan, memeriksanya, lalu menjadwalkan publikasi ke kanal resmi dinas
                  dalam satu alur kerja.
                </p>

                <div data-hero-item className="mt-10 flex flex-wrap items-center gap-3">
                  <Magnetic strength={0.18}>
                    <Link
                      href="/login"
                      className="press group inline-flex items-center gap-2.5 rounded-full border border-ink bg-ink px-7 py-3.5 text-sm font-medium text-bg hover:border-accent hover:bg-accent"
                    >
                      Masuk ke sistem
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
                  
                  <a
                    href="#tentang"
                    className="press inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm text-ink-soft hover:border-ink hover:text-ink"
                  >
                    Pelajari dulu
                    <ChevronDown className="h-4 w-4" />
                  </a>
                </div>

                <div
                  data-hero-item
                  className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-7"
                >
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">
                      <Counter to={24} suffix="+" />
                    </p>
                    <p className="mt-1 text-[11px] text-muted">Template naskah</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">
                      <Counter to={3} />
                    </p>
                    <p className="mt-1 text-[11px] text-muted">Kanal terpadu</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">
                      <Counter to={1} />
                      <span className="text-muted"> layar</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted">Kalender kerja</p>
                  </div>
                </div>
              </div>

              {/* mockup 3D */}
              <div className="lg:col-span-6">
                <Hero3DMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ============================= TENTANG ============================= */}
        <section id="tentang" className="scroll-mt-16 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">Tentang</p>
              <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                Informasi layanan yang seragam, tepat waktu, dan mudah ditelusuri.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted">
                Warga membutuhkan kepastian mengenai syarat dan prosedur pengurusan dokumen
                kependudukan. SITEKS memastikan setiap naskah yang dipublikasikan berasal dari
                sumber yang sama dan tayang sesuai rencana.
              </p>
            </Reveal>

            <Reveal
              stagger={0.12}
              className="mt-20 grid gap-px overflow-hidden border border-line md:grid-cols-3"
            >
              {PILLARS.map((p) => (
                <div
                  key={p.no}
                  className="group bg-surface p-8 transition-colors duration-500 hover:bg-bg"
                >
                  <span className="font-mono text-xs tracking-widest text-muted">{p.no}</span>
                  <h3 className="mt-8 text-lg font-medium tracking-tight">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.desc}</p>
                  <span className="mt-8 block h-px w-8 bg-line-strong transition-all duration-500 group-hover:w-20 group-hover:bg-accent" />
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ============================== FITUR ============================== */}
        <section id="fitur" className="scroll-mt-16 border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="eyebrow">Fitur</p>
                <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                  Enam hal yang dipakai setiap hari.
                </h2>
              </div>
              <p className="max-w-xs text-sm text-muted">
                Pilih salah satu kartu untuk melihat rinciannya.
              </p>
            </Reveal>

            <Reveal
              stagger={0.08}
              className="mt-16 grid gap-px border border-line sm:grid-cols-2 lg:grid-cols-3"
            >
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.title}
                    type="button"
                    onClick={() => setActiveFeature(i)}
                    className="group relative bg-bg p-8 text-left transition-colors duration-500 hover:bg-surface"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="h-5 w-5 text-ink transition-transform duration-500 group-hover:-translate-y-0.5" />
                      <ArrowUpRight className="h-4 w-4 text-line-strong transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                    <h3 className="mt-10 text-base font-medium tracking-tight">{f.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">{f.desc}</p>
                  </button>
                );
              })}
            </Reveal>
          </div>
        </section>

        {/* =============================== ALUR =============================== */}
        <section id="alur" className="scroll-mt-16 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal className="max-w-xl">
              <p className="eyebrow">Alur kerja</p>
              <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                Empat langkah, satu kali duduk.
              </h2>
            </Reveal>

            <Reveal y={40} className="mt-14">
              <WorkflowCarousel />
            </Reveal>
          </div>
        </section>

        {/* ================================ FAQ ================================ */}
        <section id="faq" className="scroll-mt-16 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">Tanya jawab</p>
              <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight">
                Pertanyaan yang sering muncul.
              </h2>
            </Reveal>

            <Reveal y={34} className="lg:col-span-8">
              <div className="border-t border-line">
                {FAQS.map((f, i) => (
                  <Faq
                    key={f.q}
                    q={f.q}
                    a={f.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================ CTA ================================ */}
        <section className="border-t border-line bg-ink text-bg">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                Mulai susun kalender konten layanan hari ini.
              </h2>
              <Magnetic strength={0.2}>
                <Link
                  href="/login"
                  className="press group inline-flex items-center gap-2.5 rounded-full bg-bg px-7 py-3.5 text-sm font-medium text-ink hover:bg-accent hover:text-bg"
                >
                  Masuk ke dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </section>

        {/* =============================== FOOTER =============================== */}
        <footer className="border-t border-line bg-bg">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold tracking-[0.18em] text-ink uppercase">
                Siteks
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Dukcapil</span>
            </div>

            <p>© {new Date().getFullYear()} Dinas Kependudukan dan Pencatatan Sipil.</p>
          </div>
        </footer>
      </SmoothScroll>

      {/* ============================ MODAL FITUR ============================ */}
      <Modal
        open={activeFeature !== null}
        onClose={() => setActiveFeature(null)}
        eyebrow="Fitur"
        title={feature?.title}
      >
        <p>{feature?.desc}</p>
        <ul className="mt-5 space-y-3">
          {feature?.detail.map((d) => (
            <li key={d} className="flex gap-3 text-sm text-muted">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {d}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}