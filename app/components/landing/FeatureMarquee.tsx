'use client';

import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

type FeatureMarqueeProps = {
  features: Feature[];
  /** rect kartu ikut dikirim supaya modal bisa "tumbuh" dari kartu itu */
  onSelect: (index: number, rect: DOMRect) => void;
};

/* --- setelan rasa geser (silakan diutak-atik) ---------------------------- */
const DRAG_THRESHOLD = 5; // px sebelum dianggap drag
const FLING_TAU = 0.55; // detik "meluncur" setelah dilepas. Makin besar → makin jauh & lama muternya
const MAX_VELOCITY = 14; // batas kecepatan lempar (kartu/detik)
const MIN_FLING = 0.6; // di bawah ini dianggap geser pelan → cukup snap ke kartu terdekat

const mod = (a: number, b: number) => ((a % b) + b) % b;

export default function FeatureMarquee({ features, onSelect }: FeatureMarqueeProps) {
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const positionRef = useRef(0); // posisi sekarang (pecahan, boleh minus / > n)
  const targetRef = useRef(0); // posisi tujuan / posisi diam terakhir
  const spacingRef = useRef(220);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const samplesRef = useRef<{ t: number; pos: number }[]>([]);
  const hoverRef = useRef<{ v: number }[]>([]); // 0..1 per kartu: seberapa "menyala" karena di-hover
  const dragRef = useRef({
    active: false,
    captured: false,
    moved: false,
    wasFlying: false,
    startX: 0,
    startPos: 0,
    pointerId: 0,
  });

  const n = features.length;

  const wrappedDistance = (i: number, pos: number) => {
    let d = (i - pos) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const applyTransforms = () => {
    const pos = positionRef.current;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = wrappedDistance(i, pos);
      const abs = Math.min(Math.abs(d), 3);
      const h = hoverRef.current[i]?.v ?? 0;
      const baseOpacity = Math.max(1 - abs * 0.32, 0.08);

      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: d * spacingRef.current,
        y: -h * 10, // terangkat sedikit saat di-hover
        z: -abs * 70, // kedalaman: kartu samping "mundur" ke belakang
        rotateY: gsap.utils.clamp(-38, 38, d * -18),
        scale: Math.max(1 - abs * 0.1, 0.62) * (1 + h * 0.04),
        // efek highlight: kartu samping yang redup "menyala" penuh saat kursor menyentuhnya
        opacity: baseOpacity + (1 - baseOpacity) * h,
        zIndex: Math.round((n - abs) * 10),
        pointerEvents: abs > 2.4 ? 'none' : 'auto',
      });
      el.classList.toggle('is-active', abs < 0.5);
    });

    // indikator titik: melebar mulus mengikuti posisi saat drag
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const t = Math.max(0, 1 - Math.abs(wrappedDistance(i, pos)));
      dot.style.width = `${8 + t * 20}px`;
      dot.style.opacity = `${0.28 + t * 0.72}`;
    });
  };

  /* ------------------------------ animasi ------------------------------ */

  const killTween = () => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  };

  const animateTo = (target: number, duration: number, ease = 'power3.out') => {
    killTween();
    targetRef.current = target;

    if (prefersReducedMotion()) {
      positionRef.current = target;
      applyTransforms();
      return;
    }

    const proxy = { value: positionRef.current };
    tweenRef.current = gsap.to(proxy, {
      value: target,
      duration,
      ease,
      onUpdate: () => {
        positionRef.current = proxy.value;
        applyTransforms();
      },
      onComplete: () => {
        tweenRef.current = null;
      },
    });
  };

  const goTo = (target: number) => animateTo(target, 0.8);

  const setHover = (i: number, target: 0 | 1) => {
    const slot = (hoverRef.current[i] ??= { v: 0 });
    gsap.killTweensOf(slot);
    if (prefersReducedMotion()) {
      slot.v = target;
      applyTransforms();
      return;
    }
    gsap.to(slot, {
      v: target,
      duration: target ? 0.35 : 0.5,
      ease: 'power2.out',
      onUpdate: applyTransforms,
    });
  };

  const goToIndex = (i: number) => {
    const base = Math.round(targetRef.current);
    goTo(base + wrappedDistance(i, base));
  };

  /** Dilepas setelah drag: lempar dengan momentum, melambat pelan, lalu berhenti tepat di tengah sebuah kartu. */
  const release = (now: number) => {
    const recent = samplesRef.current.filter((s) => now - s.t < 100);

    let v = 0;
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = (b.t - a.t) / 1000;
      if (dt > 0.008) v = (b.pos - a.pos) / dt; // kartu / detik
    }
    v = gsap.utils.clamp(-MAX_VELOCITY, MAX_VELOCITY, v);

    const pos = positionRef.current;

    if (Math.abs(v) < MIN_FLING) {
      animateTo(Math.round(pos), 0.7);
      return;
    }

    const target = Math.round(pos + v * FLING_TAU);
    const dist = Math.max(Math.abs(target - pos), 0.3);
    // ease power3.out punya kecepatan awal 3× rata-rata → durasi ini bikin
    // kecepatan awal tween ≈ kecepatan tangan saat melepas (terasa nyambung)
    const duration = gsap.utils.clamp(0.7, 2.8, (3 * dist) / Math.abs(v));
    animateTo(target, duration);
  };

  useEffect(() => {
    const measure = () => {
      const first = cardRefs.current[0];
      spacingRef.current = first ? Math.max(first.offsetWidth * 0.58, 140) : 200;
      applyTransforms();
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      killTween();
      hoverRef.current.forEach((slot) => gsap.killTweensOf(slot));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  /* -------------------------------- drag -------------------------------- */
  // Pointer TIDAK langsung di-capture saat pointerdown — supaya klik biasa
  // (tanpa geser) tetap sampai normal ke kartu / tombol. Capture baru terjadi
  // setelah gerakan melewati DRAG_THRESHOLD.

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // kalau lagi meluncur lalu disentuh: hentikan, dan klik ini bukan "pilih kartu"
    const wasFlying = tweenRef.current?.isActive() ?? false;
    killTween();

    dragRef.current = {
      active: true,
      captured: false,
      moved: false,
      wasFlying,
      startX: e.clientX,
      startPos: positionRef.current,
      pointerId: e.pointerId,
    };
    samplesRef.current = [{ t: e.timeStamp, pos: positionRef.current }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    const delta = e.clientX - d.startX;

    if (!d.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return; // belum dianggap drag
      d.moved = true;
      d.captured = true;
      // mulai hitung dari titik ini supaya tidak ada "lompatan" sebesar threshold
      d.startX = e.clientX;
      d.startPos = positionRef.current;
      e.currentTarget.setPointerCapture(d.pointerId);
      e.currentTarget.style.cursor = 'grabbing';
      return;
    }

    positionRef.current = d.startPos - (e.clientX - d.startX) / spacingRef.current;
    applyTransforms();

    const samples = samplesRef.current;
    samples.push({ t: e.timeStamp, pos: positionRef.current });
    if (samples.length > 8) samples.shift();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    e.currentTarget.style.cursor = 'grab';

    if (d.captured) {
      release(e.timeStamp);
    } else if (Math.abs(positionRef.current - Math.round(positionRef.current)) > 0.001) {
      // sempat menghentikan luncuran di tengah jalan → rapikan ke kartu terdekat
      animateTo(Math.round(positionRef.current), 0.5);
    }
    // d.moved / d.wasFlying dibiarkan — dipakai handleCardClick buat mengabaikan
    // klik yang sebenarnya ekor dari drag. Direset otomatis di pointerdown berikutnya.
  };

  /* ------------------------------- klik kartu ------------------------------ */

  const openCard = (i: number) => {
    const el = cardRefs.current[i];
    if (el) onSelect(i, el.getBoundingClientRect());
  };

  const handleCardClick = (i: number) => {
    const d = dragRef.current;
    if (d.moved || d.wasFlying) return;

    const dist = wrappedDistance(i, targetRef.current);
    if (Math.abs(dist) < 0.5) {
      openCard(i); // kartu yang lagi di tengah → buka rincian
    } else {
      goTo(Math.round(targetRef.current) + Math.round(dist)); // geser jadi tengah
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(Math.round(targetRef.current) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(Math.round(targetRef.current) + 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCard(mod(Math.round(targetRef.current), n));
    }
  };

  return (
    <div className="relative">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Daftar fitur"
        tabIndex={0}
        className="relative h-[380px] cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-[440px]"
        style={{ perspective: '1600px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <ul
          className="absolute top-1/2 left-1/2 z-0 m-0 h-0 w-0 list-none p-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <li
                key={f.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="feature-card absolute top-0 left-0 w-[260px] sm:w-[320px]"
                onClick={() => handleCardClick(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse' && !dragRef.current.captured) setHover(i, 1);
                }}
                onPointerLeave={() => setHover(i, 0)}
              >
                <div className="feature-surface group relative flex h-[300px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:h-[340px] sm:p-8">
                  {/* dekorasi: garis grid memudar + cahaya aksen (menyala di kartu aktif) */}
                  <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]"
                  />
                  <div
                    aria-hidden
                    className="feature-glow pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-ink/10 blur-3xl"
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-bg">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="relative mt-8 text-xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted">{f.desc}</p>

                  <div className="feature-cta relative mt-6 flex items-center justify-between border-t border-line pt-5 text-xs font-medium">
                    <span>Lihat rincian</span>
                    <span className="feature-cta-arrow flex h-8 w-8 items-center justify-center rounded-full border border-line">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* pudar di tepi kiri/kanan */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-40 w-12 bg-gradient-to-r from-bg to-transparent sm:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-40 w-12 bg-gradient-to-l from-bg to-transparent sm:w-32"
        />

        <button
          type="button"
          aria-label="Sebelumnya"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => goTo(Math.round(targetRef.current) - 1)}
          className="press absolute top-1/2 left-2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur hover:border-ink hover:bg-ink hover:text-bg sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Selanjutnya"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => goTo(Math.round(targetRef.current) + 1)}
          className="press absolute top-1/2 right-2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur hover:border-ink hover:bg-ink hover:text-bg sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* penunjuk posisi */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center">
          {features.map((f, i) => (
            <button
              key={f.title}
              type="button"
              aria-label={`Fitur ${i + 1}: ${f.title}`}
              onClick={() => goToIndex(i)}
              className="flex h-6 items-center px-1"
            >
              <span
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="block h-2 rounded-full bg-ink"
                style={{ width: 8, opacity: 0.28 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}