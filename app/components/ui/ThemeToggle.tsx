'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label="Ganti tema"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`press relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:border-ink ${className ?? ''}`}
    >
      {mounted && (
        <>
          <Sun
            className={`absolute h-4 w-4 transition-all duration-300 ${
              isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
          />
          <Moon
            className={`absolute h-4 w-4 transition-all duration-300 ${
              isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
            }`}
          />
        </>
      )}
    </button>
  );
}