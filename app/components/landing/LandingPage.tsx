'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  Eye,
  Layers,
  LayoutTemplate,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';

import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import Reveal from '@/app/components/ui/Reveal';
import Modal from '@/app/components/ui/Modal';
import Magnetic from '@/app/components/ui/Magnetic';
import CustomCursor from '@/app/components/ui/CustomCursor';
import HeroZoom from '@/app/components/landing/HeroZoom';
import PillarsPinned from '@/app/components/landing/PillarsPinned';
import WorkflowPath from '@/app/components/landing/WorkflowPath';
import SmoothScroll from '@/app/components/layout/SmoothScroll';
import Navbar from '@/app/components/layout/Navbar';
import FeatureMarquee from '@/app/components/landing/FeatureMarquee';

/* ------------------------------------------------------------------ data */

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Katalog template teks',
    desc: 'Narasi baku promo, pengumuman, artikel, hingga siaran pers tersimpan rapi dan siap dipakai ulang.',
    detail: [
      'Kelompokkan template berdasarkan jenis konten.',
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
    desc: 'Satu naskah dapat diarahkan ke beberapa kanal media sosial bisnis Anda sekaligus.',
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
    desc: 'Hanya anggota tim yang berwenang yang dapat menyusun dan mengubah jadwal publikasi.',
    detail: [
      'Autentikasi akun tim.',
      'Sesi berakhir otomatis saat tidak aktif.',
      'Data jadwal terpisah dari akses publik.',
    ],
  },
];

const FAQS = [
  {
    q: 'Apa itu SIMANTEN?',
    a: 'Sistem Informasi Manajemen Konten: platform untuk menyusun template naskah konten dan menjadwalkan publikasinya ke berbagai kanal media sosial secara terstruktur.',
  },
  {
    q: 'Siapa yang cocok memakai SIMANTEN?',
    a: 'Bisnis, agensi, dan tim di organisasi mana pun yang perlu mengelola banyak konten media sosial secara konsisten dan terjadwal — mulai dari tim satu orang sampai tim besar dengan beberapa penanggung jawab.',
  },
  {
    q: 'Kanal apa saja yang didukung?',
    a: 'Sistem mendukung pengelolaan naskah dan jadwal untuk beberapa kanal media sosial sekaligus, dengan penyesuaian panjang teks pada masing-masing kanal.',
  },
  {
    q: 'Apakah SIMANTEN berbayar?',
    a: 'Tidak. SIMANTEN dapat digunakan secara gratis. Cukup masuk lewat tombol Masuk dan Anda langsung bisa menyusun template serta menjadwalkan konten.',
  },
  {
    q: 'Bisakah menjadwalkan pengumuman mendesak?',
    a: 'Bisa. Jadwal dapat dibuat untuk penayangan segera maupun direncanakan beberapa minggu sebelumnya, termasuk promo kilat atau pemberitahuan pemeliharaan sistem.',
  },
];

/* ------------------------------------------------- accordion beranimasi */

function Faq({
  q,
  a,
  index,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    const inner = innerRef.current;
    const bar = barRef.current;
    if (!el || !inner || !bar) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
      gsap.set(bar, { scaleY: open ? 1 : 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.to(el, {
      height: open ? 'auto' : 0,
      opacity: open ? 1 : 0,
      duration: 0.55,
      ease: 'expo.out',
    })
      .to(bar, { scaleY: open ? 1 : 0, duration: 0.4, ease: 'power2.out' }, '<')
      .fromTo(
        inner,
        { y: open ? 10 : 0, opacity: open ? 0 : 1 },
        { y: 0, opacity: open ? 1 : 0, duration: 0.4, ease: 'power2.out' },
        '<0.1',
      );

    return () => {
      tl.kill();
    };
  }, [open]);

  return (
    <div className="relative border-b border-line">
      <div
        ref={barRef}
        className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-accent"
      />
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-6 py-6 pl-5 text-left"
      >
        <span className="flex items-baseline gap-4">
          <span className="text-xs tabular-nums text-muted">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-base font-medium tracking-tight transition-colors group-hover:text-accent sm:text-lg">
            {q}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-500 ${
            open ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>
      <div ref={bodyRef} className="h-0 overflow-hidden pl-5 opacity-0">
        <p ref={innerRef} className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">
          {a}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- halaman */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // modalOpen & featureIndex dipisah: saat modal menutup, isinya harus tetap ada
  // sampai animasi tutup selesai (kalau tidak, teks hilang duluan sebelum panel menghilang)
  const [modalOpen, setModalOpen] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const fiturRef = useRef<HTMLDivElement>(null);

  /* fitur: scroll berhenti sejenak di section ini sebelum lanjut ke alur */
  useEffect(() => {
    const el = fiturRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=60%', // jarak "tahan" tambahan — makin besar makin lama berhentinya
        pin: true,
        pinSpacing: true,
      });
    });

    return () => ctx.revert();
  }, []);

  const feature = FEATURES[featureIndex];
  const FeatureIcon = feature.icon;

  const openFeature = (index: number, rect: DOMRect) => {
    setFeatureIndex(index);
    setOriginRect(rect);
    setModalOpen(true);
  };
  const closeFeature = () => setModalOpen(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg font-sans text-ink">
      <CustomCursor />

      {/* ============================= NAVBAR ============================= */}
      <Navbar />

      <SmoothScroll>
        {/* ======================= HERO (laptop zoom) + TENTANG ======================= */}
        <HeroZoom />

        {/* pilar Tentang — panel bertumpuk, warna selang-seling gelap/terang */}
        <PillarsPinned />

        {/* ============================== FITUR ============================== */}
        <section
          id="fitur"
          ref={fiturRef}
          className="flex min-h-screen scroll-mt-16 items-center border-t border-line"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="eyebrow">Fitur</p>
                <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                  Enam hal yang dipakai setiap hari.
                </h2>
              </div>
            </Reveal>

            <Reveal y={40} className="mt-10">
              <FeatureMarquee features={FEATURES} onSelect={openFeature} />
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

            <div className="mt-16">
              <WorkflowPath />
            </div>
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

            <Reveal y={34} stagger={0.08} className="border-t border-line lg:col-span-8">
              {FAQS.map((f, i) => (
                <Faq
                  key={f.q}
                  q={f.q}
                  a={f.a}
                  index={i}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </Reveal>
          </div>
        </section>

        {/* ================================ CTA ================================ */}
        <section data-cursor-invert className="border-t border-line bg-ink text-bg">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <p className="eyebrow text-bg/50">Mulai sekarang</p>
                <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                  Kelola konten bisnis Anda, gratis.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-bg/70">
                  Buat akun dalam hitungan menit dan mulai susun kalender konten pertama Anda hari ini.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Magnetic strength={0.2}>
                  <Link
                    href="/login"
                    className="press group inline-flex items-center gap-2.5 rounded-full bg-bg px-7 py-3.5 text-sm font-medium text-ink hover:bg-accent hover:text-bg"
                  >
                    Masuk
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </section>

        {/* =============================== FOOTER =============================== */}
        <footer className="border-t border-line bg-bg">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold tracking-[0.18em] text-ink uppercase">
                Simanten
              </span>
            </div>

            <p>© {new Date().getFullYear()} SIMANTEN — Sistem Informasi Manajemen Konten.</p>
          </div>
        </footer>
      </SmoothScroll>

      {/* ============================ MODAL FITUR ============================ */}
      <Modal
        open={modalOpen}
        onClose={closeFeature}
        eyebrow="Fitur"
        title={feature.title}
        icon={<FeatureIcon className="h-5 w-5" />}
        originRect={originRect}
      >
        <p data-modal-item>{feature.desc}</p>
        <ul className="mt-6 space-y-3 border-t border-line pt-6">
          {feature.detail.map((d) => (
            <li key={d} data-modal-item className="flex gap-3 text-sm text-muted">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {d}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}