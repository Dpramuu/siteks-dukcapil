'use client';

import {
  PLATFORMS,
  type Schedule,
  type SchedulePlatform,
} from './types';
import {
  PLATFORM_ICON,
  longDate,
  progressOf,
  statusOf,
  timeOf,
} from './meta';

type Props = {
  dateKey: string;
  items: Schedule[];
  togglingId: string | null;
  onToggle: (sp: SchedulePlatform, scheduleId: string) => void;
  onPreview: (s: Schedule) => void;
  onDuplicate: (s: Schedule) => void;
  onDelete: (s: Schedule) => void;
  onCreate: () => void;
};

const ghostBtn =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function DayPanel({
  dateKey,
  items,
  togglingId,
  onToggle,
  onPreview,
  onDuplicate,
  onDelete,
  onCreate,
}: Props) {
  const now = new Date();

  return (
    <section
      aria-label="Jadwal pada tanggal terpilih"
      className="rounded-2xl border border-line bg-surface p-5"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {items.length > 0 ? `${items.length} jadwal` : 'Tidak ada jadwal'}
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight text-ink">
            {longDate(dateKey)}
          </h2>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <i className="ti ti-plus text-sm" aria-hidden="true" />
          Tambah
        </button>
      </header>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <i className="ti ti-calendar-plus text-xl" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">Belum ada jadwal</p>
            <p className="mt-1 text-xs text-muted">
              Rencanakan konten untuk tanggal ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="cursor-pointer rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Buat jadwal
          </button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((s) => {
            const st = statusOf(s, now);
            const { done, total } = progressOf(s);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const caption = (s.caption ?? '').trim();

            return (
              <li
                key={s.id}
                className="rounded-xl border border-line p-3.5 transition-colors hover:border-line-strong"
              >
                {/* Info utama */}
                <div className="flex items-start gap-3">
                  <p className="w-11 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-ink">
                    {timeOf(s.scheduled_for)}
                  </p>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 truncate text-sm font-medium text-ink">
                        {s.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    {caption && (
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-muted">
                        {caption}
                      </p>
                    )}
                  </div>

                  {s.image_url && (
                    <img
                      src={s.image_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}
                </div>

                {/* Progress */}
                <div className="mt-3.5">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {total === 1 && s.schedule_platforms?.[0]
                        ? `Diunggah ke ${
                            s.schedule_platforms[0].platform === 'Twitter'
                              ? 'X'
                              : s.schedule_platforms[0].platform
                          }`
                        : 'Diunggah ke platform'}
                    </span>
                    <span className="font-medium tabular-nums text-ink-soft">
                      {done}/{total}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progres unggah"
                    className="h-1.5 overflow-hidden rounded-full bg-line"
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Checklist platform */}
                <div
                  className={`mt-3 grid gap-1.5 ${
                    (s.schedule_platforms?.length ?? 0) === 1
                      ? 'grid-cols-1'
                      : (s.schedule_platforms?.length ?? 0) === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {PLATFORMS.map((p) => {
                    const sp = s.schedule_platforms?.find(
                      (x) => x.platform === p,
                    );
                    if (!sp) return null;

                    const busy = togglingId === sp.id;

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onToggle(sp, s.id)}
                        disabled={busy}
                        aria-pressed={sp.is_uploaded}
                        aria-label={`${p}: ${
                          sp.is_uploaded ? 'sudah diunggah' : 'belum diunggah'
                        }. Klik untuk mengubah.`}
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          sp.is_uploaded
                            ? 'border-accent bg-accent-soft text-accent'
                            : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
                        }`}
                      >
                        <i
                          className={`ti ${
                            busy
                              ? 'ti-loader-2 animate-spin'
                              : sp.is_uploaded
                                ? 'ti-circle-check-filled'
                                : PLATFORM_ICON[p]
                          } text-sm`}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {p === 'Twitter' ? 'X' : p}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Aksi */}
                <div className="mt-3 flex items-center gap-1 border-t border-line pt-2.5">
                  <button
                    type="button"
                    onClick={() => onPreview(s)}
                    className={ghostBtn}
                  >
                    <i className="ti ti-eye text-sm" aria-hidden="true" />
                    Pratinjau
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(s)}
                    className={ghostBtn}
                    title="Buat jadwal baru dengan isi yang sama"
                  >
                    <i className="ti ti-copy text-sm" aria-hidden="true" />
                    Duplikat
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s)}
                    aria-label={`Hapus jadwal ${s.title}`}
                    title="Hapus"
                    className="ml-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                  >
                    <i className="ti ti-trash text-base" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}