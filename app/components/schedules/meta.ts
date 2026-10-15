import type { Platform, Schedule } from './types';

export const PLATFORM_ICON: Record<Platform, string> = {
  Instagram: 'ti-brand-instagram',
  TikTok: 'ti-brand-tiktok',
  Twitter: 'ti-brand-x',
};

export const PLATFORM_LIMIT: Record<Platform, number> = {
  Instagram: 2200,
  TikTok: 2200,
  Twitter: 280,
};

export const pad = (n: number) => String(n).padStart(2, '0');

export const toDate = (v: string | Date | null | undefined): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Kunci tanggal LOKAL (YYYY-MM-DD) — tidak bergeser karena UTC */
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const scheduleDateKey = (s: Schedule) => {
  const d = toDate(s.scheduled_for);
  return d ? dateKey(d) : '';
};

export const timeOf = (v: string | Date | null | undefined) => {
  const d = toDate(v);
  return d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '--:--';
};

export const longDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const byTime = (a: Schedule, b: Schedule) =>
  (toDate(a.scheduled_for)?.getTime() ?? 0) -
  (toDate(b.scheduled_for)?.getTime() ?? 0);

export const progressOf = (s: Schedule) => {
  const list = s.schedule_platforms ?? [];
  return {
    done: list.filter((p) => p.is_uploaded).length,
    total: list.length,
  };
};

export const isDone = (s: Schedule) => {
  const { done, total } = progressOf(s);
  return total > 0 && done === total;
};

export const isPending = (s: Schedule) => {
  const { done, total } = progressOf(s);
  return total > 0 && done < total;
};

export const isOverdue = (s: Schedule, now = new Date()) => {
  const d = toDate(s.scheduled_for);
  return !!d && d.getTime() < now.getTime() && isPending(s);
};

export const statusOf = (s: Schedule, now = new Date()) => {
  if (isOverdue(s, now))
    return { label: 'Terlewat', className: 'bg-danger/10 text-danger' };
  if (isDone(s)) return { label: 'Selesai', className: 'bg-ink text-bg' };
  if (s.status === 'draft')
    return { label: 'Draft', className: 'border border-line text-muted' };
  return { label: 'Terjadwal', className: 'bg-accent-soft text-accent' };
};