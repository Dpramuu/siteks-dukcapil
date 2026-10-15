'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  onClose: () => void;
  titleId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissOnBackdrop?: boolean;
  children: ReactNode;
};

const SIZE = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
} as const;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Tumpukan dialog: hanya dialog paling atas yang merespons keyboard
const stack: symbol[] = [];

export default function Dialog({
  onClose,
  titleId,
  size = 'md',
  dismissOnBackdrop = true,
  children,
}: Props) {
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const id = Symbol('dialog');
    stack.push(id);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => setShown(true));

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;

      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(id);
      if (i > -1) stack.splice(i, 1);
      previouslyFocused?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 sm:items-center sm:p-4 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => dismissOnBackdrop && closeRef.current()}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface text-ink shadow-2xl transition-all duration-300 ease-out sm:rounded-2xl ${SIZE[size]} ${
          shown
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-6 scale-[0.98] opacity-0'
        }`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}