'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

const PILLARS = [
  {
    no: '01',
    title: 'Konsistensi pesan',
    desc: 'Satu sumber naskah untuk seluruh kanal, sehingga syarat dan prosedur layanan tidak lagi berbeda antar unggahan.',
    theme: 'dark' as const,
  },
  {
    no: '02',
    title: 'Kepastian waktu',
    desc: 'Kalender redaksi tersusun lebih awal. Pengumuman penting tidak lagi bergantung pada ingatan petugas.',
    theme: 'light' as const,
  },
  {
    no: '03',
    title: 'Jangkauan warga',
    desc: 'Naskah disesuaikan karakter tiap kanal agar informasi layanan terbaca oleh kelompok usia yang berbeda.',
    theme: 'dark' as const,
  },
];

export default function PillarsPinned() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.pillar-panel');
      // panel terakhir tidak perlu pin+fade — dia yang menutup panel sebelumnya
      const pinnable = panels.slice(0, -1);

      pinnable.forEach((panel) => {
        // hanya konten di dalam yang menyusut/pudar — background panel tetap solid
        // penuh layar supaya tidak ada celah yang menampakkan section di belakangnya
        const inner = panel.querySelector('.pillar-inner');
        if (!inner) return;

        gsap.fromTo(
          inner,
          { scale: 1, opacity: 1 },
          {
            scale: 0.85,
            opacity: 0.25,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top top',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative isolate z-10">
      {PILLARS.map((p, i) => (
        <section
          key={p.no}
          data-cursor-invert={p.theme === 'dark' ? true : undefined}
          className={`pillar-panel relative flex h-screen flex-col justify-center overflow-hidden px-5 sm:px-8 ${
            p.theme === 'dark' ? 'bg-ink text-bg' : 'bg-surface text-ink'
          }`}
          style={{ zIndex: i + 1 }}
        >
          <div className="pillar-inner mx-auto w-full max-w-6xl">
            <span
              className={`font-mono text-xs tracking-widest ${
                p.theme === 'dark' ? 'text-bg/50' : 'text-muted'
              }`}
            >
              {p.no}
            </span>
            <h3 className="mt-8 text-4xl font-medium tracking-tight sm:text-6xl">{p.title}</h3>
            <p
              className={`mt-6 max-w-md text-base leading-relaxed sm:text-lg ${
                p.theme === 'dark' ? 'text-bg/70' : 'text-muted'
              }`}
            >
              {p.desc}
            </p>
            <span
              className={`mt-10 block h-px w-16 ${p.theme === 'dark' ? 'bg-bg/40' : 'bg-line-strong'}`}
            />
          </div>
        </section>
      ))}
    </div>
  );
}