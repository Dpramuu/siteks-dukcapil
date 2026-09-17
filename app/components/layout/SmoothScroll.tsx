'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollSmoother, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

export default function SmoothScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const created = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // cegah instance ganda saat React Strict Mode / hot reload
    let smoother = ScrollSmoother.get();
    if (!smoother && !created.current) {
      created.current = true;
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
      });
    }

    ScrollTrigger.refresh();

    return () => {
      smoother?.kill();
      created.current = false;
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" className={className}>
        {children}
      </div>
    </div>
  );
}