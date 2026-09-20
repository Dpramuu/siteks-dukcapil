'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  /** ikon kecil di atas judul */
  icon?: ReactNode;
  /** posisi elemen pemicu (mis. kartu yang diklik). Panel akan "tumbuh" dari sini dan kembali ke sini saat ditutup. */
  originRect?: DOMRect | null;
  /** elemen anak yang punya atribut `data-modal-item` akan muncul berurutan */
  children: ReactNode;
};

type FlipState = { x: number; y: number; scaleX: number; scaleY: number };

/** Hitung transform awal panel supaya tampak keluar dari kartu pemicu (FLIP). */
function flipFrom(panel: HTMLElement, origin: DOMRect | null | undefined, reduce: boolean): FlipState {
  if (reduce) return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  if (!origin || origin.width === 0) return { x: 0, y: 40, scaleX: 0.96, scaleY: 0.96 };

  const p = panel.getBoundingClientRect(); // posisi akhir — belum ada transform
  return {
    x: origin.left + origin.width / 2 - (p.left + p.width / 2),
    y: origin.top + origin.height / 2 - (p.top + p.height / 2),
    scaleX: gsap.utils.clamp(0.3, 1, origin.width / p.width),
    scaleY: gsap.utils.clamp(0.3, 1, origin.height / p.height),
  };
}

export default function Modal({
  open,
  onClose,
  title,
  eyebrow,
  icon,
  originRect,
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  if (open && !mounted) setMounted(true);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const readyRef = useRef(false); // state awal (tersembunyi) sudah dipasang?
  const fromRef = useRef<FlipState>({ x: 0, y: 40, scaleX: 0.96, scaleY: 0.96 });

  /* ------------------------------ animasi ------------------------------ */
  // Pakai tween `to` (bukan timeline.reverse) supaya buka/tutup bisa saling
  // menyela dengan mulus, dan penutupan TIDAK bergantung pada callback reverse.
  useLayoutEffect(() => {
    if (!mounted) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const reduce = prefersReducedMotion();
    const items = panel.querySelectorAll<HTMLElement>('[data-modal-item]');

    const finishClose = () => {
      readyRef.current = false;
      setMounted(false);
    };

    if (open) {
      if (!readyRef.current) {
        readyRef.current = true;
        fromRef.current = flipFrom(panel, originRect, reduce);
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(panel, { opacity: 0, ...fromRef.current, transformOrigin: '50% 50%' });
        gsap.set(items, { opacity: 0, y: reduce ? 0 : 16 });
      }

      const tl = gsap.timeline();
      tl.to(backdrop, { opacity: 1, duration: reduce ? 0 : 0.45, ease: 'power2.out' }, 0)
        .to(panel, { opacity: 1, duration: reduce ? 0 : 0.25, ease: 'power1.out' }, 0)
        .to(
          panel,
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: reduce ? 0 : 0.8, ease: 'power4.out' },
          0,
        )
        .to(
          items,
          {
            opacity: 1,
            y: 0,
            duration: reduce ? 0 : 0.55,
            stagger: reduce ? 0 : 0.07,
            ease: 'power3.out',
          },
          reduce ? 0 : 0.3,
        );

      return () => {
        tl.kill();
      };
    }

    /* ------------------------------ tutup ------------------------------ */
    if (reduce) {
      finishClose();
      return;
    }

    const tl = gsap.timeline({ onComplete: finishClose });
    tl.to(
      items,
      { opacity: 0, y: -6, duration: 0.18, stagger: { each: 0.025, from: 'end' }, ease: 'power2.in' },
      0,
    )
      .to(panel, { ...fromRef.current, duration: 0.5, ease: 'power3.inOut' }, 0.05)
      .to(panel, { opacity: 0, duration: 0.22, ease: 'power1.in' }, 0.33)
      .to(backdrop, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.15);

    // jaring pengaman: overlay tidak boleh sampai "nyangkut" menutupi halaman
    const fallback = window.setTimeout(finishClose, 1200);

    return () => {
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, [open, mounted, originRect]);

  /* fokus ke tombol tutup saat terbuka */
  useEffect(() => {
    if (open && mounted) closeRef.current?.focus({ preventScroll: true });
  }, [open, mounted]);

  /* kunci scroll halaman selama modal ada */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  /* Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <div
        ref={backdropRef}
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-ink/40 backdrop-blur-[6px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface p-7 shadow-[0_40px_120px_-40px_rgba(17,17,19,0.55)] sm:p-9"
      >
        {/* dekorasi: cahaya aksen di pojok */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-ink/10 blur-3xl"
        />

        {/* z-20: WAJIB di atas semua [data-modal-item]. Elemen yang punya transform
            (dari GSAP) membentuk stacking context sendiri dan akan menimpa tombol ini
            kalau z-index-nya tidak lebih tinggi — itu penyebab tombol X tidak bisa diklik. */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="press absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:top-5 sm:right-5"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          {icon && (
            <div
              data-modal-item
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"
            >
              {icon}
            </div>
          )}
          {eyebrow && (
            <p data-modal-item className="eyebrow mb-3 pr-14">
              {eyebrow}
            </p>
          )}
          {title && (
            <h3
              data-modal-item
              className="mb-5 max-w-[85%] text-2xl font-semibold tracking-tight"
            >
              {title}
            </h3>
          )}
          <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
        </div>
      </div>
    </div>
  );
}