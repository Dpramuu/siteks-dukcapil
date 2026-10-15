'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

/** class di <html> yang membuat cursor bawaan disembunyikan (lihat globals.css) */
const ACTIVE_CLASS = 'has-custom-cursor';
/** elemen yang membuat ring membesar saat di-hover */
const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor]';
/** field teks memakai caret bawaan browser; cursor custom disembunyikan di atasnya */
const NATIVE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

/** posisi pointer terakhir — dipakai lagi saat komponen ini dipasang ulang di
 *  halaman lain (mis. landing → login), supaya cursor langsung tampil dan tidak
 *  "hilang" sampai mouse digerakkan lagi */
let lastKnown: { x: number; y: number } | null = null;

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || prefersReducedMotion()) return;

    // cursor bawaan baru disembunyikan SETELAH kursor custom siap dipakai.
    // Kalau komponen ini tidak aktif / sudah unmount, class dilepas lagi,
    // jadi halaman tidak pernah berakhir tanpa cursor sama sekali.
    const root = document.documentElement;
    root.classList.add(ACTIVE_CLASS);

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });

    let seen = false; // sudah pernah ada pointermove
    let inside = true; // pointer masih di dalam jendela
    let overField = false; // sedang di atas input / textarea
    let isOnDark = false;
    let isHoveringEl = false;
    let lastX = 0;
    let lastY = 0;

    const syncVisibility = () => {
      const visible = seen && inside && !overField;
      gsap.to([ring, dot], { opacity: visible ? 1 : 0, duration: 0.25, overwrite: 'auto' });
    };

    // warna dasar (saat tidak sedang hover elemen interaktif) mengikuti apakah
    // kursor sedang berada di atas section ber-bg gelap ([data-cursor-invert])
    // atau tidak — supaya kursor gelap tidak hilang saat masuk ke bg hitam
    const applyBaseColor = () => {
      if (isHoveringEl) return;
      const c = isOnDark ? '#ffffff' : 'var(--color-ink)';
      gsap.to(ring, { borderColor: c, duration: 0.3 });
      gsap.to(dot, { backgroundColor: c, duration: 0.3 });
    };

    const setHover = (v: boolean) => {
      isHoveringEl = v;
      if (v) {
        gsap.to(ring, { scale: 2.1, borderColor: 'var(--color-accent)', duration: 0.4 });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: isOnDark ? '#ffffff' : 'var(--color-ink)',
          duration: 0.4,
        });
      }
    };

    // satu pintu untuk membaca elemen di bawah kursor: warna latar, field teks,
    // dan elemen interaktif. Dipanggil saat mouse bergerak DAN tiap frame, jadi
    // tetap benar walau konten berubah di bawah kursor yang diam (scroll,
    // pindah halaman, error message muncul) — tanpa listener per-elemen.
    const inspect = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);

      const dark = !!el?.closest('[data-cursor-invert]');
      if (dark !== isOnDark) {
        isOnDark = dark;
        applyBaseColor();
      }

      const field = !!el?.closest(NATIVE_SELECTOR);
      if (field !== overField) {
        overField = field;
        syncVisibility();
      }

      const hovering = !field && !!el?.closest(HOVER_SELECTOR);
      if (hovering !== isHoveringEl) setHover(hovering);
    };

    const move = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      lastKnown = { x: lastX, y: lastY };

      let changed = false;
      if (!seen) {
        // posisi awal langsung di titik pointer, bukan terbang dari pojok kiri atas
        gsap.set([ring, dot], { x: lastX, y: lastY });
        seen = true;
        changed = true;
      }
      if (!inside) {
        inside = true;
        changed = true;
      }

      ringX(lastX);
      ringY(lastY);
      dotX(lastX);
      dotY(lastY);

      inspect(lastX, lastY);
      if (changed) syncVisibility();
    };

    // pointer keluar dari jendela browser → sembunyikan, jangan menggantung di tepi
    const out = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      inside = false;
      lastKnown = null;
      syncVisibility();
    };

    const tick = () => {
      if (!seen || !inside) return;
      inspect(lastX, lastY);
    };
    gsap.ticker.add(tick);

    // dipasang ulang di halaman baru: langsung tampil di posisi pointer terakhir
    if (lastKnown) {
      lastX = lastKnown.x;
      lastY = lastKnown.y;
      gsap.set([ring, dot], { x: lastX, y: lastY });
      seen = true;
      inspect(lastX, lastY);
      syncVisibility();
    }

    const down = () => gsap.to(ring, { scale: 0.75, duration: 0.2 });
    const up = () => gsap.to(ring, { scale: isHoveringEl ? 2.1 : 1, duration: 0.3 });

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('mouseout', out);

    return () => {
      root.classList.remove(ACTIVE_CLASS);
      gsap.ticker.remove(tick);
      gsap.killTweensOf([ring, dot]);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] hidden md:block">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-7 w-7 rounded-full border border-ink opacity-0"
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1 w-1 rounded-full bg-ink opacity-0"
      />
    </div>
  );
}