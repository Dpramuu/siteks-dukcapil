'use client';

import { DAYS, MONTHS, PLATFORM_STYLE, STATUS_STYLE, type FilterType, type Schedule } from './types';

type Props = {
  cur: Date;
  setCur: (d: Date) => void;
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  schedules: Schedule[];
  selected: { date: string; items: Schedule[] } | null;
  setSelected: (v: { date: string; items: Schedule[] } | null) => void;
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua',     value: 'all' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'TikTok',   value: 'TikTok' },
  { label: 'Twitter',  value: 'Twitter' },
];

// Ekstrak "YYYY-MM-DD" dari ISO string scheduled_for
const toDateStr = (iso: string | null | undefined) => iso ? iso.slice(0, 10) : '';

// Ekstrak "HH:MM" dari ISO string scheduled_for
const toTimeStr = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function Calendar({
  cur, setCur,
  filter, setFilter,
  schedules,
  selected, setSelected,
}: Props) {
  const today = new Date();
  const y = cur.getFullYear();
  const m = cur.getMonth();
  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const filtered = filter === 'all'
    ? schedules
    : schedules.filter(s => s.platform === filter);

  const getDateStr = (d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isToday = (d: number) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  return (
    <>
      {/* ── Header + Filter ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Schedule</h1>
          <p className="text-xs text-zinc-500 mt-1">{MONTHS[m]} {y} · Kelola jadwal konten</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setSelected(null); }}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                filter === f.value
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Navigasi Bulan ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setCur(new Date(y, m - 1, 1)); setSelected(null); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-white">{MONTHS[m]} {y}</span>
        <button
          onClick={() => { setCur(new Date(y, m + 1, 1)); setSelected(null); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          ›
        </button>
      </div>

      {/* ── Grid Kalender ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs text-zinc-500 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="min-h-16 border-r border-b border-zinc-800 bg-zinc-950" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d       = i + 1;
            const dateStr = getDateStr(d);
            // Cocokkan tanggal dari scheduled_for
            const dayScheds = filtered.filter(s => s.scheduled_for && toDateStr(s.scheduled_for) === dateStr);
            const col = (firstDay + i) % 7;
            return (
              <div
                key={d}
                onClick={() => dayScheds.length && setSelected({ date: dateStr, items: dayScheds })}
                className={`min-h-16 p-1.5 border-b border-zinc-800 transition-colors
                  ${col < 6 ? 'border-r border-zinc-800' : ''}
                  ${dayScheds.length ? 'cursor-pointer hover:bg-zinc-800/50' : 'cursor-default'}
                  ${selected?.date === dateStr ? 'bg-zinc-800/50' : ''}
                `}
              >
                <div className={`w-5 h-5 flex items-center justify-center text-xs mb-1 rounded-full
                  ${isToday(d) ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400'}`}>
                  {d}
                </div>
                {dayScheds.slice(0, 2).map((s, idx) => {
                  const st = PLATFORM_STYLE[s.platform];
                  return (
                    <div
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded mb-0.5 truncate"
                      style={{ background: st.bg, color: st.tc }}
                    >
                      {s.title}
                    </div>
                  );
                })}
                {dayScheds.length > 2 && (
                  <div className="text-[9px] text-zinc-500 pl-1">+{dayScheds.length - 2} lagi</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail klik tanggal ── */}
      {selected && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">
              {parseInt(selected.date.split('-')[2])}{' '}
              {MONTHS[parseInt(selected.date.split('-')[1]) - 1]}{' '}
              {selected.date.split('-')[0]}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-800">
            {selected.items.map((s, i) => {
              const st  = PLATFORM_STYLE[s.platform];
              const sst = STATUS_STYLE[s.status];
              return (
                <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: st.color }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">{s.title}</p>
                    {/* Ekstrak jam dari scheduled_for */}
                    <p className="text-xs text-zinc-500 mt-0.5">{toTimeStr(s.scheduled_for)}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-block"
                        style={{ background: st.bg, color: st.tc }}
                      >
                        {s.platform}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-block"
                        style={{ background: sst.bg, color: sst.tc }}
                      >
                        {sst.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}