'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  MONTHS,
  PLATFORMS,
  type Platform,
} from '@/app/components/schedules/types';

export type MonthBucket = {
  done: number;
  pending: number;
  overdue: number;
};

type UpcomingSchedule = {
  id: string;
  title: string;
  scheduled_for: string;
  schedule_platforms: { platform: Platform; is_uploaded: boolean }[];
};

type Props = {
  stats: {
    totalKonten: number;
    terjadwal: number;
    terlewat: number;
    terbit: number;
    draft: number;
  };
  platformStats: Record<Platform, { total: number; uploaded: number }>;
  monthlyByYear: Record<string, MonthBucket[]>;
  years: number[];
  upcomingSchedules: UpcomingSchedule[];
};

const PLATFORM_ICON: Record<Platform, string> = {
  Instagram: 'ti-brand-instagram',
  TikTok: 'ti-brand-tiktok',
  Twitter: 'ti-brand-x',
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const EMPTY_YEAR: MonthBucket[] = Array.from({ length: 12 }, () => ({
  done: 0,
  pending: 0,
  overdue: 0,
}));

function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return ready;
}

export default function DashboardPage({
  stats,
  platformStats,
  monthlyByYear,
  years,
  upcomingSchedules,
}: Props) {
  const ready = useReady();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [year, setYear] = useState(
    years.includes(currentYear) ? currentYear : years[years.length - 1],
  );

  /* ───────── statistik ───────── */

  const publishedPct =
    stats.totalKonten > 0
      ? Math.round((stats.terbit / stats.totalKonten) * 100)
      : 0;

  const statCards = [
    {
      label: 'Total konten',
      value: stats.totalKonten,
      sub:
        stats.draft > 0
          ? `Semua waktu · ${stats.draft} tanpa jadwal`
          : 'Semua waktu',
      icon: 'ti-files',
      danger: false,
    },
    {
      label: 'Terjadwal',
      value: stats.terjadwal,
      sub: 'Menunggu waktu tayang',
      icon: 'ti-calendar-time',
      danger: false,
    },
    {
      label: 'Terlewat',
      value: stats.terlewat,
      sub: 'Waktu lewat, belum diunggah',
      icon: 'ti-alert-triangle',
      danger: stats.terlewat > 0,
    },
    {
      label: 'Terbit',
      value: stats.terbit,
      sub: `${publishedPct}% · diunggah ke semua platform`,
      icon: 'ti-circle-check',
      danger: false,
      progress: publishedPct,
    },
  ];

  /* ───────── grafik bulanan ───────── */

  const buckets = monthlyByYear[String(year)] ?? EMPTY_YEAR;
  const totals = buckets.map((b) => b.done + b.pending + b.overdue);

  const yearTotal = totals.reduce((a, b) => a + b, 0);
  const yearDone = buckets.reduce((a, b) => a + b.done, 0);
  const maxMonth = Math.max(...totals, 0);
  const peakIndex = maxMonth > 0 ? totals.indexOf(maxMonth) : -1;
  const donePct = yearTotal > 0 ? Math.round((yearDone / yearTotal) * 100) : 0;

  const top = Math.max(4, Math.ceil(maxMonth / 4) * 4);
  const ticks = [top, (top * 3) / 4, top / 2, top / 4, 0];

  const yearIdx = years.indexOf(year);

  /* ───────── format tanggal ───────── */

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const time = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isSameDay(d, now)) return `Hari ini, ${time}`;
    if (isSameDay(d, tomorrow)) return `Besok, ${time}`;
    return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${time}`;
  };

  const countdown = (iso: string) => {
    const min = Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
    if (min <= 0) return 'Sekarang';
    if (min < 60) return `${min} menit lagi`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} jam lagi`;
    return `${Math.floor(h / 24)} hari lagi`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* ═════════ Header ═════════ */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {MONTHS[currentMonth]} {currentYear}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ringkasan konten dan jadwal kamu.
          </p>
        </div>

        <Link
          href="/schedules"
          className={`inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] ${focusRing}`}
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Jadwal baru
        </Link>
      </header>

      {/* ═════════ Statistik ═════════ */}
      <section
        aria-label="Statistik konten"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <Link
            key={s.label}
            href="/schedules"
            className={`group rounded-2xl border bg-surface p-5 transition-all hover:shadow-sm ${focusRing} ${
              s.danger
                ? 'border-danger/40 hover:border-danger'
                : 'border-line hover:border-line-strong'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-soft">{s.label}</p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  s.danger
                    ? 'bg-danger/10 text-danger'
                    : 'bg-accent-soft text-accent'
                }`}
              >
                <i className={`ti ${s.icon} text-lg`} aria-hidden="true" />
              </span>
            </div>

            <p
              className={`mt-4 text-4xl font-semibold tabular-nums tracking-tight ${
                s.danger ? 'text-danger' : 'text-ink'
              }`}
            >
              {s.value.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted">{s.sub}</p>

            {s.progress !== undefined && (
              <div
                role="progressbar"
                aria-valuenow={s.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Persentase konten terbit"
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
                  style={{ width: ready ? `${s.progress}%` : '0%' }}
                />
              </div>
            )}
          </Link>
        ))}
      </section>

      {/* ═════════ Jadwal terdekat + Platform ═════════ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Jadwal terdekat */}
        <div className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">
                Jadwal terdekat
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Konten yang akan tayang berikutnya
              </p>
            </div>
            <Link
              href="/schedules"
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft ${focusRing}`}
            >
              Lihat semua
              <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
            </Link>
          </div>

          {stats.terlewat > 0 && (
            <Link
              href="/schedules"
              className={`mb-3 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger transition-colors hover:bg-danger/15 ${focusRing}`}
            >
              <i className="ti ti-alert-triangle text-base" aria-hidden="true" />
              <span className="flex-1">
                <span className="font-semibold">{stats.terlewat} jadwal</span>{' '}
                terlewat dan belum diunggah ke semua platform.
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                Tinjau
                <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
              </span>
            </Link>
          )}

          {upcomingSchedules.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <i className="ti ti-calendar-plus text-2xl" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  Belum ada jadwal mendatang
                </p>
                <p className="mt-1 text-xs text-muted">
                  Buat jadwal agar konten tayang tepat waktu.
                </p>
              </div>
              <Link
                href="/schedules"
                className={`rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white hover:opacity-90 ${focusRing}`}
              >
                Buat jadwal
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingSchedules.map((s, i) => {
                const d = new Date(s.scheduled_for);
                const uploaded = s.schedule_platforms.filter(
                  (p) => p.is_uploaded,
                ).length;
                const total = s.schedule_platforms.length;

                return (
                  <li key={s.id}>
                    <Link
                      href="/schedules"
                      className={`group flex items-center gap-4 rounded-xl border p-3.5 transition-colors ${
                        i === 0
                          ? 'border-accent/40 bg-accent-soft/40 hover:bg-accent-soft/70'
                          : 'border-line hover:border-line-strong hover:bg-bg'
                      } ${focusRing}`}
                    >
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-surface">
                        <span className="text-lg font-semibold leading-none tabular-nums text-ink">
                          {d.getDate()}
                        </span>
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                          {MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-ink">
                            {s.title}
                          </p>
                          {i === 0 && (
                            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                              Berikutnya
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted"
                          suppressHydrationWarning
                        >
                          <span className="inline-flex items-center gap-1">
                            <i className="ti ti-clock text-sm" aria-hidden="true" />
                            {formatWhen(s.scheduled_for)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={i === 0 ? 'font-medium text-accent' : ''}
                          >
                            {countdown(s.scheduled_for)}
                          </span>
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {s.schedule_platforms.map((sp) => (
                            <span
                              key={sp.platform}
                              title={
                                sp.is_uploaded
                                  ? `${sp.platform}: sudah diunggah`
                                  : `${sp.platform}: belum diunggah`
                              }
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                sp.is_uploaded
                                  ? 'bg-accent-soft text-accent'
                                  : 'border border-line text-muted'
                              }`}
                            >
                              <i
                                className={`ti ${
                                  sp.is_uploaded
                                    ? 'ti-circle-check-filled'
                                    : PLATFORM_ICON[sp.platform]
                                } text-xs`}
                                aria-hidden="true"
                              />
                              {sp.platform}
                            </span>
                          ))}
                          {total > 0 && (
                            <span className="text-[11px] text-muted">
                              {uploaded}/{total} diunggah
                            </span>
                          )}
                        </div>
                      </div>

                      <i
                        className="ti ti-chevron-right text-base text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4">
          {/* Status unggah per platform */}
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-ink">
              Status unggah per platform
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Berapa konten yang sudah diunggah di tiap kanal
            </p>

            <ul className="mt-5 flex flex-col gap-4">
              {PLATFORMS.map((p) => {
                const { total, uploaded } = platformStats[p];
                const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0;

                return (
                  <li key={p} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink-soft">
                        <i
                          className={`ti ${PLATFORM_ICON[p]} text-base text-muted`}
                          aria-hidden="true"
                        />
                        {p}
                      </span>
                      <span className="tabular-nums text-ink">
                        <span className="font-semibold">{uploaded}</span>
                        <span className="text-muted">/{total}</span>
                        <span className="ml-1.5 text-xs text-muted">{pct}%</span>
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progres unggah ${p}`}
                      className="h-2 overflow-hidden rounded-full bg-line"
                    >
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
                        style={{ width: ready ? `${pct}%` : '0%' }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pintasan */}
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-ink">Pintasan</h2>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                {
                  href: '/schedules',
                  icon: 'ti-calendar',
                  label: 'Buka kalender jadwal',
                },
                {
                  href: '/template',
                  icon: 'ti-file-text',
                  label: 'Kelola template',
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm text-ink-soft transition-colors hover:border-line-strong hover:bg-bg hover:text-ink ${focusRing}`}
                >
                  <i className={`ti ${a.icon} text-lg text-accent`} aria-hidden="true" />
                  <span className="flex-1">{a.label}</span>
                  <i
                    className="ti ti-arrow-right text-base text-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ Aktivitas bulanan ═════════ */}
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Aktivitas konten
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Jumlah jadwal per bulan, dikelompokkan berdasarkan status
            </p>
          </div>

          {/* Pilih tahun */}
          <div className="flex items-center gap-1.5">
            {years.length > 1 && (
              <button
                type="button"
                onClick={() => setYear(years[yearIdx - 1])}
                disabled={yearIdx <= 0}
                aria-label="Tahun sebelumnya"
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
              >
                <i className="ti ti-chevron-left text-base" aria-hidden="true" />
              </button>
            )}
            <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-ink">
              {year}
            </span>
            {years.length > 1 && (
              <button
                type="button"
                onClick={() => setYear(years[yearIdx + 1])}
                disabled={yearIdx >= years.length - 1}
                aria-label="Tahun berikutnya"
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
              >
                <i className="ti ti-chevron-right text-base" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan tahun */}
        <dl className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
          <div>
            <dt className="text-[11px] text-muted">Total {year}</dt>
            <dd className="text-lg font-semibold tabular-nums text-ink">
              {yearTotal}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Selesai</dt>
            <dd className="text-lg font-semibold tabular-nums text-ink">
              {donePct}%
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Tersibuk</dt>
            <dd className="text-lg font-semibold text-ink">
              {peakIndex >= 0 ? (
                <>
                  {MONTHS[peakIndex].slice(0, 3)}
                  <span className="ml-1 text-xs font-normal text-muted">
                    ({maxMonth})
                  </span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>

        {/* Grafik */}
        <div className="mt-6 flex gap-3">
          {/* Sumbu Y */}
          <div
            className="flex h-52 flex-col justify-between text-right text-[11px] tabular-nums text-muted"
            aria-hidden="true"
          >
            {ticks.map((t) => (
              <span key={t} className="leading-none">
                {t}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative h-52">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {ticks.map((t) => (
                  <div
                    key={t}
                    className={`h-px w-full ${t === 0 ? 'bg-line-strong' : 'bg-line'}`}
                  />
                ))}
              </div>

              {yearTotal === 0 && (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                  Belum ada jadwal di tahun {year}
                </p>
              )}

              <div className="relative flex h-full items-end gap-1.5 sm:gap-3">
                {buckets.map((b, i) => {
                  const total = totals[i];
                  const h = (total / top) * 100;

                  const tooltipPos =
                    i < 2
                      ? 'left-0'
                      : i > 9
                        ? 'right-0'
                        : 'left-1/2 -translate-x-1/2';

                  return (
                    <div
                      key={i}
                      tabIndex={0}
                      aria-label={`${MONTHS[i]} ${year}: ${total} jadwal. ${b.done} selesai, ${b.pending} terjadwal, ${b.overdue} terlewat.`}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
                    >
                      {/* Tooltip */}
                      {total > 0 && (
                        <div
                          role="tooltip"
                          className={`pointer-events-none absolute z-10 flex min-w-32 flex-col gap-0.5 rounded-lg bg-ink px-3 py-2 text-xs text-bg opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${tooltipPos}`}
                          style={{ bottom: `calc(${h}% + 8px)` }}
                        >
                          <span className="font-semibold">
                            {MONTHS[i]} {year} · {total}
                          </span>
                          {b.done > 0 && <span>Selesai: {b.done}</span>}
                          {b.pending > 0 && <span>Terjadwal: {b.pending}</span>}
                          {b.overdue > 0 && <span>Terlewat: {b.overdue}</span>}
                        </div>
                      )}

                      {/* Bar bertumpuk: selesai (bawah) → terjadwal → terlewat (atas) */}
                      <div
                        className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-t-md transition-[height,opacity] duration-700 ease-out group-hover:opacity-80 group-focus-visible:opacity-80"
                        style={{
                          height: ready ? `${total > 0 ? Math.max(h, 3) : 0}%` : '0%',
                          minHeight: total === 0 ? 2 : undefined,
                          transitionDelay: `${i * 40}ms`,
                        }}
                      >
                        {total === 0 ? (
                          <div className="h-full bg-line-strong" />
                        ) : (
                          <>
                            {b.done > 0 && (
                              <div
                                className="bg-ink"
                                style={{ flex: `${b.done} 1 0%` }}
                              />
                            )}
                            {b.pending > 0 && (
                              <div
                                className="bg-accent"
                                style={{ flex: `${b.pending} 1 0%` }}
                              />
                            )}
                            {b.overdue > 0 && (
                              <div
                                className="bg-danger"
                                style={{ flex: `${b.overdue} 1 0%` }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Label bulan */}
            <div className="mt-2 flex gap-1.5 sm:gap-3">
              {MONTHS.map((m, i) => {
                const isCurrent = year === currentYear && i === currentMonth;
                return (
                  <div
                    key={m}
                    className={`flex-1 text-center text-[10px] sm:text-xs ${
                      isCurrent ? 'font-semibold text-accent' : 'text-muted'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-ink" />
            Selesai (semua platform)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Terjadwal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-danger" />
            Terlewat
          </span>
        </div>
      </section>
    </div>
  );
}