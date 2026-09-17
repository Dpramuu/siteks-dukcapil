'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  {
    step: '01',
    title: 'Susun teks',
    desc: 'Ambil template narasi layanan yang sudah baku, atau tulis naskah baru untuk topik adminduk tertentu.',
  },
  {
    step: '02',
    title: 'Pilih kanal & waktu',
    desc: 'Tentukan kanal publikasi serta tanggal dan jam tayang yang paling tepat untuk warga.',
  },
  {
    step: '03',
    title: 'Periksa pratinjau',
    desc: 'Cek kerapian baris, panjang teks, dan penempatan tagar sebelum jadwal dikunci.',
  },
  {
    step: '04',
    title: 'Pantau kalender',
    desc: 'Lihat agenda harian dan bulanan, lengkap dengan status draf, terjadwal, dan terbit.',
  },
];

export default function WorkflowCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(STEPS.length - 1);
  const pausedRef = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!track || !items.length) return;
    const perView = Math.max(1, Math.round(track.offsetWidth / items[0].offsetWidth));
    setMaxIndex(Math.max(0, STEPS.length - perView));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  /* geser track */
  useEffect(() => {
    const track = trackRef.current;
    const target = itemsRef.current[index];
    if (!track || !target) return;
    gsap.to(track, { x: -target.offsetLeft, duration: 0.85, ease: 'expo.out' });
  }, [index]);

  /* autoplay */
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [maxIndex]);

  /* drag geser */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let startX = 0;
    let dragging = false;

    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      pausedRef.current = true;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      pausedRef.current = false;
      const delta = e.clientX - startX;
      if (Math.abs(delta) < 40) return;
      setIndex((i) => (delta < 0 ? Math.min(i + 1, maxIndex) : Math.max(i - 1, 0)));
    };

    track.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      track.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [maxIndex]);

  return (
    <div
      className="relative"
      onPointerEnter={() => (pausedRef.current = true)}
      onPointerLeave={() => (pausedRef.current = false)}
    >
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex cursor-grab active:cursor-grabbing">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              ref={(el) => {
                if (el) itemsRef.current[i] = el;
              }}
              className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3"
            >
              <div className="group h-full rounded-2xl border border-line bg-surface p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-ink">
                <span className="font-mono text-xs tracking-widest text-muted">{s.step}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.desc}</p>
                <span className="mt-6 block h-px w-8 bg-line-strong transition-all duration-500 group-hover:w-16 group-hover:bg-accent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* kontrol */}
      <div className="mt-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ke slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? 'w-8 bg-ink' : 'w-4 bg-line-strong hover:bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-bg"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Selanjutnya"
            onClick={() => setIndex((i) => Math.min(i + 1, maxIndex))}
            disabled={index >= maxIndex}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-bg"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}