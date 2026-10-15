'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import TemplateCard from './templateCard';
import TemplateFormModal from './templateFormModal';
import TemplateDeleteConfirm from './templateDeleteConfirm';
import { PLATFORMS, PLATFORM_META } from './meta';
import type { Platform, Template, TemplateInsert } from './types';

type FilterType = 'all' | Platform;
type SortType = 'newest' | 'name';

type Props = {
  initialTemplates: Template[];
  userId: string;
};

const FILTERS: FilterType[] = ['all', ...PLATFORMS];

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const parseError = async (res: Response, fallback: string) => {
  try {
    const json = await res.json();
    return (json?.error as string) ?? fallback;
  } catch {
    return fallback;
  }
};

const time = (v: string | Date) => new Date(v).getTime() || 0;

export default function TemplatePage({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  // Shortcut: tekan "/" untuk fokus ke pencarian
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || isFormOpen || deleteTarget) return;

      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable);
      if (typing) return;

      e.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFormOpen, deleteTarget]);

  /* ───────── data turunan ───────── */

  const counts = useMemo(() => {
    const base: Record<FilterType, number> = {
      all: templates.length,
      Instagram: 0,
      TikTok: 0,
      Twitter: 0,
    };
    for (const t of templates) base[t.platform]++;
    return base;
  }, [templates]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = templates.filter(
      (t) =>
        (filter === 'all' || t.platform === filter) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)),
    );

    return [...list].sort(
      sort === 'name'
        ? (a, b) => a.name.localeCompare(b.name, 'id')
        : (a, b) => time(b.updated_at) - time(a.updated_at),
    );
  }, [templates, query, filter, sort]);

  const isFiltering = query.trim() !== '' || filter !== 'all';

  /* ───────── aksi ───────── */

  const openCreate = () => {
    setEditTarget(null);
    setIsFormOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditTarget(t);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
  };

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
  };

  // Mengembalikan pesan error (untuk ditampilkan di modal) atau null jika sukses
  const handleSave = async (data: TemplateInsert): Promise<string | null> => {
    setApiError(null);

    try {
      if (editTarget) {
        const res = await fetch(`/api/templates/${editTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) return await parseError(res, 'Gagal memperbarui template.');

        const updated: Template = await res.json();
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        notify('Template berhasil diperbarui');
      } else {
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) return await parseError(res, 'Gagal menyimpan template.');

        const created: Template = await res.json();
        setTemplates((prev) => [created, ...prev]);
        notify('Template berhasil dibuat');
      }

      closeForm();
      return null;
    } catch {
      return 'Tidak dapat terhubung ke server. Coba lagi.';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setApiError(null);

    try {
      const res = await fetch(`/api/templates/${target.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setApiError(await parseError(res, 'Gagal menghapus template.'));
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== target.id));
        notify(`"${target.name}" dihapus`);
      }
    } catch {
      setApiError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ───────── render ───────── */

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {templates.length} template tersimpan
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Template
          </h1>
          <p className="mt-1 text-sm text-muted">
            Caption siap pakai untuk setiap platform.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] ${focusRing}`}
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Buat template
        </button>
      </header>

      {/* Error API */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <i className="ti ti-alert-circle mt-0.5 text-base" aria-hidden="true" />
          <p className="flex-1">{apiError}</p>
          <button
            type="button"
            onClick={() => setApiError(null)}
            aria-label="Tutup pesan error"
            className="cursor-pointer text-danger/70 hover:text-danger"
          >
            <i className="ti ti-x text-base" aria-hidden="true" />
          </button>
        </div>
      )}

      {templates.length === 0 ? (
        /* ═════════ Kosong total ═════════ */
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <i className="ti ti-file-text text-3xl" aria-hidden="true" />
          </span>
          <div className="max-w-sm">
            <p className="text-base font-semibold text-ink">
              Belum ada template
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Simpan caption yang sering dipakai agar tidak perlu mengetik
              ulang setiap kali membuat jadwal.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 ${focusRing}`}
          >
            <i className="ti ti-plus text-base" aria-hidden="true" />
            Buat template pertama
          </button>
        </div>
      ) : (
        <>
          {/* ═════════ Toolbar ═════════ */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Pencarian */}
              <div className="relative flex-1">
                <i
                  className="ti ti-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-muted"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setQuery('');
                      e.currentTarget.blur();
                    }
                  }}
                  aria-label="Cari template"
                  placeholder="Cari nama atau isi template…"
                  className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchRef.current?.focus();
                    }}
                    aria-label="Hapus pencarian"
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-bg hover:text-ink"
                  >
                    <i className="ti ti-x text-sm" aria-hidden="true" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">
                    /
                  </kbd>
                )}
              </div>

              {/* Urutkan */}
              <div className="relative sm:w-52">
                <i
                  className="ti ti-arrows-sort pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-muted"
                  aria-hidden="true"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  aria-label="Urutkan template"
                  className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="newest">Terbaru diperbarui</option>
                  <option value="name">Nama A–Z</option>
                </select>
                <i
                  className="ti ti-chevron-down pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Filter platform */}
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={active}
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                      active
                        ? 'border-ink bg-ink text-bg'
                        : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    {f !== 'all' && (
                      <i
                        className={`ti ${PLATFORM_META[f].icon} text-base`}
                        aria-hidden="true"
                      />
                    )}
                    {f === 'all' ? 'Semua' : f}
                    <span
                      className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                        active ? 'bg-bg/20 text-bg' : 'bg-bg text-muted'
                      }`}
                    >
                      {counts[f]}
                    </span>
                  </button>
                );
              })}
            </div>

            {isFiltering && (
              <p className="text-xs text-muted" aria-live="polite">
                Menampilkan {visible.length} dari {templates.length} template
              </p>
            )}
          </div>

          {/* ═════════ Daftar ═════════ */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <i className="ti ti-search-off text-2xl" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  Template tidak ditemukan
                </p>
                <p className="mt-1 text-xs text-muted">
                  Coba kata kunci lain atau ganti filter platform.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className={`cursor-pointer rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft hover:border-line-strong hover:text-ink ${focusRing}`}
              >
                Reset pencarian & filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}

              {!isFiltering && (
                <button
                  type="button"
                  onClick={openCreate}
                  className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent ${focusRing}`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current transition-transform group-hover:scale-105">
                    <i className="ti ti-plus text-xl" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium">Buat template baru</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal form create/edit */}
      {isFormOpen && (
        <TemplateFormModal
          key={editTarget?.id ?? 'new'}
          initial={editTarget}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <TemplateDeleteConfirm
          template={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8"
      >
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">
            <i className="ti ti-circle-check-filled text-base" aria-hidden="true" />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}