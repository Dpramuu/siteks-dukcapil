'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type RevealProps = {
  children: ReactNode;
  className?: string;
  y?: number;
  x?: number;
  delay?: number;
  /** jika diisi, anak langsung dianimasikan berurutan */
  stagger?: number;
  start?: string;
};

export default function Reveal({
  children,
  className,
  y = 26,
  x = 0,
  delay = 0,
  stagger,
  start = 'top 85%',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: HTMLElement[] = stagger
      ? (Array.from(el.children) as HTMLElement[])
      : [el];

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y, x },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.95,
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, x, delay, stagger, start]);

  return (
    <div
      ref={ref}
      {...(stagger ? { 'data-reveal-group': '' } : { 'data-reveal': '' })}
      className={className}
    >
      {children}
    </div>
  );
}