'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type CounterProps = {
  to: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

export default function Counter({
  to,
  from = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1.8,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (v: number) =>
      `${prefix}${v.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    if (prefersReducedMotion()) {
      el.textContent = format(to);
      return;
    }

    const state = { value: from };
    el.textContent = format(from);

    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(state.value);
        },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [to, from, suffix, prefix, decimals, duration]);

  return <span ref={ref} className={className} />;
}