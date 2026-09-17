'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, Clock3, FileText } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import Counter from '@/app/components/ui/Counter';

const AGENDA = [
  { title: 'Alur & syarat KTP-el', time: '09:00', status: 'Terjadwal' },
  { title: 'Aktivasi IKD', time: '13:30', status: 'Terjadwal' },
  { title: 'Akta kelahiran bayi', time: '16:00', status: 'Draf' },
];

const DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

export default function Hero3DMockup() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  /* simulasi loading -> skeleton */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  /* 3D tilt mengikuti kursor + float idle + parallax scroll */
  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set(card, { transformPerspective: 1400, transformOrigin: '50% 50%' });

      /* masuk */
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, rotateX: -14, rotateY: 16 },
        { opacity: 1, y: 0, rotateX: 6, rotateY: -9, duration: 1.4, ease: 'expo.out' },
      );

      /* idle float */
      const float = gsap.to(card, {
        yPercent: -2.2,
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      /* parallax scroll — tiap layer beda kecepatan */
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const depth = Number(el.dataset.parallax);
        gsap.to(el, {
          yPercent: depth * -12,
          ease: 'none',
          scrollTrigger: {
            trigger: scene,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      /* tilt kursor */
      const rx = gsap.quickTo(card, 'rotateX', { duration: 0.8, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotateY', { duration: 0.8, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(6 - py * 16);
        ry(-9 + px * 22);
      };
      const reset = () => {
        rx(6);
        ry(-9);
      };

      scene.addEventListener('pointermove', move);
      scene.addEventListener('pointerleave', reset);

      return () => {
        float.kill();
        scene.removeEventListener('pointermove', move);
        scene.removeEventListener('pointerleave', reset);
      };
    }, scene);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sceneRef} className="scene-3d relative select-none py-6">
      {/* bidang belakang */}
      <div
        data-parallax="1"
        className="absolute top-10 -right-6 h-56 w-56 rounded-2xl border border-line bg-surface/50 grid-lines"
        aria-hidden
      />

      <div
        ref={cardRef}
        className="layer-3d relative mx-auto w-full max-w-md rounded-2xl border border-line bg-surface shadow-[0_40px_90px_-50px_rgba(17,17,19,0.45)]"
        style={{ transform: 'rotateX(6deg) rotateY(-9deg)' }}
      >
        {/* bar atas */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
          </div>
          <span className="font-mono text-[11px] tracking-wider text-muted">
            siteks / kalender
          </span>
        </div>

        {/* isi */}
        <div className="space-y-5 px-5 py-5" style={{ transform: 'translateZ(24px)' }}>
          {/* strip hari */}
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((d, i) => (
              <div
                key={`${d}-${i}`}
                className={`flex h-11 flex-col items-center justify-center rounded-lg border text-[10px] ${
                  i === 2 ? 'border-ink bg-ink text-bg' : 'border-line text-muted'
                }`}
              >
                <span className="font-mono">{d}</span>
                <span className="mt-0.5 text-[11px] font-medium">{12 + i}</span>
              </div>
            ))}
          </div>

          {/* daftar agenda / skeleton */}
          <div className="space-y-2.5">
            {loading
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-line p-3.5">
                    <div className="skeleton h-3 w-2/3" />
                    <div className="skeleton mt-2 h-2.5 w-1/3" />
                  </div>
                ))
              : AGENDA.map((item, i) => (
                  <div
                    key={item.title}
                    className="group flex items-center justify-between rounded-xl border border-line p-3.5 transition-colors hover:border-ink"
                    style={{ transform: `translateZ(${8 + i * 6}px)` }}
                  >
                    <div>
                      <p className="text-[13px] font-medium">{item.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted">
                        <Clock3 className="h-3 w-3" />
                        {item.time}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-[9px] tracking-wider uppercase ${
                        item.status === 'Terjadwal' ? 'text-accent' : 'text-muted'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* kartu melayang depan */}
        <div
          data-parallax="2"
          className="absolute -bottom-8 -left-6 w-44 rounded-xl border border-line bg-surface p-4 shadow-[0_24px_50px_-28px_rgba(17,17,19,0.4)]"
          style={{ transform: 'translateZ(90px)' }}
        >
          <div className="flex items-center gap-2 text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="font-mono text-[10px] tracking-wider uppercase">Minggu ini</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            <Counter to={12} />
            <span className="text-muted"> jadwal</span>
          </p>
        </div>

        {/* chip melayang kanan atas */}
        <div
          data-parallax="3"
          className="absolute -top-5 right-6 flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 shadow-[0_18px_40px_-24px_rgba(17,17,19,0.4)]"
          style={{ transform: 'translateZ(120px)' }}
        >
          <Check className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-medium">Siap terbit</span>
        </div>

        {/* chip template kiri */}
        <div
          data-parallax="1.5"
          className="absolute -left-10 top-20 hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 shadow-[0_18px_40px_-24px_rgba(17,17,19,0.35)] sm:flex"
          style={{ transform: 'translateZ(60px)' }}
        >
          <FileText className="h-3.5 w-3.5 text-muted" />
          <span className="font-mono text-[10px] tracking-wider text-muted">
            <Counter to={24} /> TEMPLATE
          </span>
        </div>
      </div>
    </div>
  );
}