'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || prefersReducedMotion()) return;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });

    let shown = false;
    let isOnDark = false;
    let isHoveringEl = false;
    let lastX = 0;
    let lastY = 0;

    // warna dasar (saat tidak sedang hover elemen interaktif) mengikuti apakah
    // kursor sedang berada di atas section ber-bg gelap ([data-cursor-invert])
    // atau tidak — supaya kursor gelap tidak hilang saat masuk ke bg hitam
    const applyBaseColor = () => {
      if (isHoveringEl) return;
      const c = isOnDark ? '#ffffff' : 'var(--color-ink)';
      gsap.to(ring, { borderColor: c, duration: 0.3 });
      gsap.to(dot, { backgroundColor: c, duration: 0.3 });
    };

    // dipakai baik saat mouse bergerak maupun saat halaman di-scroll (mouse diam,
    // tapi elemen di bawah kursor berubah karena ScrollSmoother menggerakkan konten)
    const checkBackground = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const dark = !!el?.closest('[data-cursor-invert]');
      if (dark !== isOnDark) {
        isOnDark = dark;
        applyBaseColor();
      }
    };

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      lastX = e.clientX;
      lastY = e.clientY;
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);

      checkBackground(e.clientX, e.clientY);
    };

    // scroll (termasuk lewat ScrollSmoother) tidak memicu pointermove, jadi
    // dicek ulang tiap frame pakai posisi mouse terakhir yang diketahui
    const tick = () => {
      if (!shown) return;
      checkBackground(lastX, lastY);
    };
    gsap.ticker.add(tick);

    const enter = () => {
      isHoveringEl = true;
      gsap.to(ring, { scale: 2.1, borderColor: 'var(--color-accent)', duration: 0.4 });
    };
    const leave = () => {
      isHoveringEl = false;
      gsap.to(ring, {
        scale: 1,
        borderColor: isOnDark ? '#ffffff' : 'var(--color-ink)',
        duration: 0.4,
      });
    };
    const down = () => gsap.to(ring, { scale: 0.75, duration: 0.2 });
    const up = () => gsap.to(ring, { scale: 1, duration: 0.3 });

    const hoverables = document.querySelectorAll<HTMLElement>('a, button, [data-cursor]');
    hoverables.forEach((el) => {
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
    });

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      hoverables.forEach((el) => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
      });
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