'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
};

export default function Modal({ open, onClose, title, eyebrow, children }: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const reduce = prefersReducedMotion();
    const items = panel.querySelectorAll<HTMLElement>('[data-modal-item]');

    const tl = gsap
      .timeline({ paused: true })
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.35, ease: 'power2.out' })
      .fromTo(
        panel,
        { opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: reduce ? 0 : 0.55, ease: 'expo.out' },
        '-=0.2',
      )
      .fromTo(
        items,
        { opacity: 0, y: reduce ? 0 : 12 },
        { opacity: 1, y: 0, duration: reduce ? 0 : 0.5, stagger: reduce ? 0 : 0.06 },
        '-=0.3',
      );

    tlRef.current = tl;
    tl.play(0);

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [mounted]);

  /* tutup: mainkan timeline mundur lalu unmount */
  useEffect(() => {
    if (open || !mounted) return;
    const tl = tlRef.current;
    if (!tl) {
      setMounted(false);
      return;
    }
    tl.eventCallback('onReverseComplete', () => setMounted(false));
    tl.reverse();
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <div
        ref={backdropRef}
        onClick={onClose}
        className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-7 shadow-[0_24px_80px_-32px_rgba(17,17,19,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="press absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:border-ink hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        {eyebrow && (
          <p data-modal-item className="eyebrow mb-3">
            {eyebrow}
          </p>
        )}
        {title && (
          <h3 data-modal-item className="mb-4 max-w-[85%] text-xl font-semibold tracking-tight">
            {title}
          </h3>
        )}
        <div data-modal-item className="text-sm leading-relaxed text-ink-soft">
          {children}
        </div>
      </div>
    </div>
  );
}