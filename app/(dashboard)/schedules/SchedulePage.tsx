'use client';

import { useEffect, useRef, useState } from 'react';

import Dialog from '@/app/components/ui/Dialog';
import Calendar from '@/app/components/schedules/calendar';
import DayPanel from '@/app/components/schedules/dayPanel';
import LivePreview from '@/app/components/schedules/livePreview';
import ScheduleForm, {
  type ComposerInitial,
} from '@/app/components/schedules/scheduleForm';
import {
  byTime,
  dateKey,
  isDone,
  isOverdue,
  isPending,
  scheduleDateKey,
  timeOf,
  toDate,
} from '@/app/components/schedules/meta';
import type {
  Platform,
  Schedule,
  SchedulePlatform,
  Template,
} from '@/app/components/schedules/types';

type Props = {
  initialSchedules: Schedule[];
  initialTemplates: Template[];
  userId?: string;
  user?: unknown;
};

type StatusFilter = 'all' | 'pending' | 'done';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function SchedulePage({
  initialSchedules,
  initialTemplates,
}: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules ?? []);
  const templates = initialTemplates ?? [];

  const today = new Date();
  const [cur, setCur] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [filter, setFilter] = useState<StatusFilter>('all');

  const [composer, setComposer] = useState<{ initial: ComposerInitial } | null>(
    null,
  );
  const [previewTarget, setPreviewTarget] = useState<Schedule | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<Platform>('Instagram');
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    text: string;
    kind: 'success' | 'error';
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const notify = (text: string, kind: 'success' | 'error' = 'success') => {
    setToast({ text, kind });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  /* ───────── data turunan ───────── */

  const now = new Date();

  const monthItems = schedules.filter((s) => {
    const d = toDate(s.scheduled_for);
    return (
      d && d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth()
    );
  });

  const stats = {
    total: monthItems.length,
    done: monthItems.filter(isDone).length,
    pending: monthItems.filter(isPending).length,
    overdue: monthItems.filter((s) => isOverdue(s, now)).length,
  };

  const visible = schedules.filter((s) =>
    filter === 'all' ? true : filter === 'done' ? isDone(s) : isPending(s),
  );

  const dayItems = visible
    .filter((s) => scheduleDateKey(s) === selectedDate)
    .sort(byTime);

  const FILTERS: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'Semua', count: stats.total },
    { value: 'pending', label: 'Belum selesai', count: stats.pending },
    { value: 'done', label: 'Selesai', count: stats.done },
  ];

  /* ───────── navigasi ───────── */

  const goMonth = (d: Date) => {
    setCur(d);
    const t = new Date();
    setSelectedDate(
      d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth()
        ? dateKey(t)
        : dateKey(d),
    );
  };

  const goToday = () => {
    const t = new Date();
    setCur(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(dateKey(t));
  };

  /* ───────── aksi ───────── */

  const openCreate = () => setComposer({ initial: { date: selectedDate } });

  const handleDuplicate = (s: Schedule) =>
    setComposer({
      initial: {
        title: s.title,
        caption: s.caption ?? '',
        imageUrl: s.image_url ?? null,
        date: selectedDate,
        time: timeOf(s.scheduled_for),
      },
    });

  const handleSaved = (saved: Schedule) => {
    setSchedules((prev) => [...prev, saved]);

    const d = toDate(saved.scheduled_for);
    if (d) {
      setCur(new Date(d.getFullYear(), d.getMonth(), 1));
      setSelectedDate(dateKey(d));
    }

    setComposer(null);
    notify('Jadwal berhasil disimpan');
  };

  const handleToggle = async (sp: SchedulePlatform, scheduleId: string) => {
    setTogglingId(sp.id);

    try {
      const res = await fetch(`/api/schedules-platforms/${sp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_uploaded: !sp.is_uploaded }),
      });

      if (!res.ok) throw new Error();

      const {
        platform: updated,
        status,
      }: { platform: SchedulePlatform; status: string } = await res.json();

      setSchedules((prev) =>
        prev.map((s) =>
          s.id !== scheduleId
            ? s
            : {
                ...s,
                status: status as Schedule['status'],
                schedule_platforms: s.schedule_platforms?.map((p) =>
                  p.id === updated.id ? updated : p,
                ),
              },
        ),
      );
    } catch {
      notify('Gagal memperbarui status unggah', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleting(true);

    try {
      const res = await fetch(`/api/schedules/${target.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      setSchedules((prev) => prev.filter((s) => s.id !== target.id));
      notify('Jadwal dihapus');
    } catch {
      notify('Gagal menghapus jadwal', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openPreview = (s: Schedule) => {
    setPreviewTarget(s);
    setPreviewPlatform('Instagram');
  };

  const copyCaption = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Caption disalin');
    } catch {
      notify('Gagal menyalin caption', 'error');
    }
  };

  /* ───────── render ───────── */

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">{stats.total}</span> jadwal
            bulan ini · <span className="font-medium text-ink">{stats.done}</span>{' '}
            selesai
            {stats.overdue > 0 && (
              <>
                {' '}
                ·{' '}
                <span className="font-medium text-danger">
                  {stats.overdue} terlewat
                </span>
              </>
            )}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Jadwal
          </h1>
          <p className="mt-1 text-sm text-muted">
            Rencanakan konten dan lacak unggahan ke tiap platform.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] ${focusRing}`}
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Jadwal baru
        </button>
      </header>

      {/* Filter status */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                active
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                  active ? 'bg-bg/20 text-bg' : 'bg-bg text-muted'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kalender + agenda */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <Calendar
          cur={cur}
          schedules={visible}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrev={() => goMonth(new Date(cur.getFullYear(), cur.getMonth() - 1, 1))}
          onNext={() => goMonth(new Date(cur.getFullYear(), cur.getMonth() + 1, 1))}
          onToday={goToday}
        />

        <div className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:rounded-2xl">
          <DayPanel
            dateKey={selectedDate}
            items={dayItems}
            togglingId={togglingId}
            onToggle={handleToggle}
            onPreview={openPreview}
            onDuplicate={handleDuplicate}
            onDelete={setDeleteTarget}
            onCreate={openCreate}
          />
        </div>
      </div>

      {/* Composer */}
      {composer && (
        <ScheduleForm
          key={JSON.stringify(composer.initial)}
          initial={composer.initial}
          templates={templates}
          onSaved={handleSaved}
          onClose={() => setComposer(null)}
        />
      )}

      {/* Pratinjau jadwal tersimpan */}
      {previewTarget && (
        <Dialog
          onClose={() => setPreviewTarget(null)}
          titleId="schedule-preview-title"
          size="md"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <p className="text-xs text-muted">Pratinjau jadwal</p>
              <h2
                id="schedule-preview-title"
                className="mt-0.5 truncate text-lg font-semibold tracking-tight text-ink"
              >
                {previewTarget.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPreviewTarget(null)}
              aria-label="Tutup"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink"
            >
              <i className="ti ti-x text-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="bg-bg p-5">
            <LivePreview
              platform={previewPlatform}
              setPlatform={setPreviewPlatform}
              title={previewTarget.title}
              caption={previewTarget.caption ?? ''}
              photo={previewTarget.image_url ?? null}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
            <button
              type="button"
              onClick={() => copyCaption(previewTarget.caption ?? '')}
              disabled={!previewTarget.caption}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="ti ti-copy text-base" aria-hidden="true" />
              Salin caption
            </button>
            <button
              type="button"
              onClick={() => setPreviewTarget(null)}
              className="cursor-pointer rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90"
            >
              Tutup
            </button>
          </div>
        </Dialog>
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <Dialog
          onClose={() => !deleting && setDeleteTarget(null)}
          titleId="schedule-delete-title"
          size="sm"
        >
          <div className="p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                <i className="ti ti-trash text-2xl" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="schedule-delete-title"
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  Hapus jadwal ini?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Jadwal{' '}
                  <span className="font-medium text-ink">
                    {deleteTarget.title}
                  </span>{' '}
                  akan dihapus permanen beserta status unggah tiap platform.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="cursor-pointer rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
                )}
                {deleting ? 'Menghapus…' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8"
      >
        {toast && (
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
              toast.kind === 'error' ? 'bg-danger text-bg' : 'bg-ink text-bg'
            }`}
          >
            <i
              className={`ti ${
                toast.kind === 'error'
                  ? 'ti-alert-circle-filled'
                  : 'ti-circle-check-filled'
              } text-base`}
              aria-hidden="true"
            />
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}