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
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const enter = () =>
      gsap.to(ring, { scale: 2.1, borderColor: 'var(--color-accent)', duration: 0.4 });
    const leave = () =>
      gsap.to(ring, { scale: 1, borderColor: 'var(--color-ink)', duration: 0.4 });
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