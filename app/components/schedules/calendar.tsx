'use client';

import { useMemo } from 'react';

import { DAYS, MONTHS, type Schedule } from './types';
import {
  byTime,
  dateKey,
  isDone,
  isOverdue,
  pad,
  scheduleDateKey,
  timeOf,
} from './meta';

type Props = {
  cur: Date;
  schedules: Schedule[];
  selectedDate: string;
  onSelectDate: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

const navBtn =
  'flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const tone = (s: Schedule, now: Date) =>
  isOverdue(s, now)
    ? { chip: 'bg-danger/10 text-danger', dot: 'bg-danger' }
    : isDone(s)
      ? { chip: 'bg-bg text-muted', dot: 'bg-muted' }
      : { chip: 'bg-accent-soft text-accent', dot: 'bg-accent' };

export default function Calendar({
  cur,
  schedules,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const now = new Date();
  const todayKey = dateKey(now);

  const y = cur.getFullYear();
  const m = cur.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const trailing = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  const byDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of schedules) {
      const k = scheduleDateKey(s);
      if (!k) continue;
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    map.forEach((list) => list.sort(byTime));
    return map;
  }, [schedules]);

  return (
    <section
      aria-label={`Kalender ${MONTHS[m]} ${y}`}
      className="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
          {MONTHS[m]} {y}
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToday}
            className="h-9 cursor-pointer rounded-lg border border-line px-3 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Bulan sebelumnya"
            className={navBtn}
          >
            <i className="ti ti-chevron-left text-lg" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Bulan berikutnya"
            className={navBtn}
          >
            <i className="ti ti-chevron-right text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Nama hari */}
      <div className="grid grid-cols-7 border-b border-line bg-bg/60">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-px bg-line">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`lead-${i}`} className="bg-bg/60" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const key = `${y}-${pad(m + 1)}-${pad(d)}`;
          const items = byDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              aria-pressed={isSelected}
              aria-label={`${d} ${MONTHS[m]} ${y}${
                items.length ? `, ${items.length} jadwal` : ', tidak ada jadwal'
              }`}
              className={`relative flex min-h-[64px] cursor-pointer flex-col items-stretch gap-1 bg-surface p-1.5 text-left transition-colors hover:bg-bg focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-accent md:min-h-[108px] md:p-2 ${
                isSelected ? 'z-10 ring-2 ring-inset ring-accent' : ''
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium tabular-nums ${
                  isToday ? 'bg-accent text-white' : 'text-ink-soft'
                }`}
              >
                {d}
              </span>

              {/* Desktop: chip jadwal */}
              <div className="hidden flex-col gap-1 md:flex">
                {items.slice(0, 2).map((s) => {
                  const t = tone(s, now);
                  return (
                    <span
                      key={s.id}
                      className={`flex items-center gap-1 truncate rounded-md px-1.5 py-1 text-[11px] font-medium leading-none ${t.chip}`}
                    >
                      {isDone(s) ? (
                        <i className="ti ti-check text-[11px]" aria-hidden="true" />
                      ) : (
                        <span className="tabular-nums opacity-70">
                          {timeOf(s.scheduled_for)}
                        </span>
                      )}
                      <span className="truncate">{s.title}</span>
                    </span>
                  );
                })}
                {items.length > 2 && (
                  <span className="px-1 text-[11px] text-muted">
                    +{items.length - 2} lagi
                  </span>
                )}
              </div>

              {/* Mobile: titik */}
              {items.length > 0 && (
                <div className="mt-auto flex items-center gap-1 md:hidden">
                  {items.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className={`h-1.5 w-1.5 rounded-full ${tone(s, now).dot}`}
                    />
                  ))}
                  {items.length > 3 && (
                    <span className="text-[10px] leading-none text-muted">+</span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {Array.from({ length: trailing }).map((_, i) => (
          <div key={`trail-${i}`} className="bg-bg/60" />
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-3 text-[11px] text-muted sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Belum diunggah
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted" />
          Selesai
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" />
          Terlewat
        </span>
      </div>
    </section>
  );
}