'use client';

import { useState } from 'react';
import Link from 'next/link';

import Dialog from '@/app/components/ui/Dialog';
import { PLATFORMS, type Platform, type Template } from './types';
import { PLATFORM_ICON } from './meta';

type Props = {
  templates: Template[];
  onSelect: (t: Template) => void;
  onClose: () => void;
};

type Filter = 'all' | Platform;

export default function TemplateModal({ templates, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const q = query.trim().toLowerCase();

  const list = templates.filter(
    (t) =>
      (filter === 'all' || t.platform === filter) &&
      (!q ||
        t.name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q)),
  );

  return (
    <Dialog onClose={onClose} titleId="template-picker-title" size="md">
      <div className="flex max-h-[85vh] flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2
              id="template-picker-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Pilih template
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Caption akan terisi otomatis. Kamu masih bisa mengeditnya.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Pencarian + filter */}
        <div className="flex flex-col gap-3 px-6 pt-4">
          <div className="relative">
            <i
              className="ti ti-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-muted"
              aria-hidden="true"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari template"
              placeholder="Cari nama atau isi template…"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(['all', ...PLATFORMS] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  filter === f
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
                }`}
              >
                {f === 'all' ? 'Semua' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                <i className="ti ti-file-off text-xl" aria-hidden="true" />
              </span>
              <p className="text-sm text-muted">
                {templates.length === 0
                  ? 'Belum ada template tersimpan.'
                  : 'Tidak ada template yang cocok.'}
              </p>
              {templates.length === 0 && (
                <Link
                  href="/template"
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Buat template di halaman Template
                </Link>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {list.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(t)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <i
                        className={`ti ${PLATFORM_ICON[t.platform]} text-lg`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {t.name}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">
                        {t.content}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
}