'use client';

import { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { DAYS, MONTHS, PLATFORM_STYLE, STATUS_STYLE, PLATFORMS, type FilterType, type Schedule, type SchedulePlatform } from './types';

type Props = {
  cur: Date;
  setCur: (d: Date) => void;
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  selected: { date: string; items: Schedule[] } | null;
  setSelected: (v: { date: string; items: Schedule[] } | null) => void;
  previewScheduleId?: string | null;
  onSelectPreviewSchedule?: (s: Schedule) => void;
  onLoadIntoForm?: (s: Schedule) => void;
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua',     value: 'all' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'TikTok',   value: 'TikTok' },
  { label: 'Twitter',  value: 'Twitter' },
];

const toDateStr = (iso: string | null | undefined) => iso ? iso.slice(0, 10) : '';
const toTimeStr = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function Calendar({
  cur, setCur,
  filter, setFilter,
  schedules, setSchedules,
  selected, setSelected,
  previewScheduleId,
  onSelectPreviewSchedule,
  onLoadIntoForm,
}: Props) {
  const today = new Date();
  const y = cur.getFullYear();
  const m = cur.getMonth();
  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? (schedules ?? [])
    : (schedules ?? []).filter(s =>
        s.schedule_platforms?.some(p => p.platform === filter)
      );

  const getDateStr = (d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isToday = (d: number) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  // Toggle is_uploaded — update platform + status schedule
  const handleToggle = async (sp: SchedulePlatform, scheduleId: string) => {
    setToggling(sp.id);

    const res = await fetch(`/api/schedules-platforms/${sp.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_uploaded: !sp.is_uploaded }),
    });

    if (!res.ok) {
      setToggling(null);
      return;
    }

    // Response berisi { platform, status }
    const { platform: updatedPlatform, status: newStatus }: {
      platform: SchedulePlatform;
      status: string;
    } = await res.json();

    // Update schedules state — platform + status sekaligus
    const updateSchedule = (s: Schedule): Schedule => {
      if (s.id !== scheduleId) return s;
      return {
        ...s,
        status: newStatus as Schedule['status'],
        schedule_platforms: s.schedule_platforms?.map(p =>
          p.id === updatedPlatform.id ? updatedPlatform : p
        ),
      };
    };

    const newSchedules = schedules.map(updateSchedule);
    setSchedules(newSchedules);

    // Update selected juga kalau sedang terbuka
    if (selected) {
      setSelected({
        ...selected,
        items: selected.items.map(updateSchedule),
      });
    }

    setToggling(null);
  };

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
            const dayScheds = filtered.filter(s => s.scheduled_for && toDateStr(s.scheduled_for) === dateStr);
            const col = (firstDay + i) % 7;
            return (
              <div
                key={d}
                onClick={() => {
                  if (dayScheds.length) {
                    setSelected({ date: dateStr, items: dayScheds });
                    onSelectPreviewSchedule?.(dayScheds[0]);
                  }
                }}
                className={`min-h-16 p-1.5 border-b border-zinc-800 transition-colors
                  ${col < 6 ? 'border-r border-zinc-800' : ''}
                  ${dayScheds.length ? 'cursor-pointer hover:bg-zinc-800/50' : 'cursor-default'}
                  ${selected?.date === dateStr ? 'bg-zinc-800/60 ring-1 ring-inset ring-blue-500/40' : ''}
                `}
              >
                <div className={`w-5 h-5 flex items-center justify-center text-xs mb-1 rounded-full
                  ${isToday(d) ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400'}`}>
                  {d}
                </div>
                {dayScheds.slice(0, 2).map((s, idx) => {
                  const allUploaded = s.schedule_platforms?.every(p => p.is_uploaded);
                  const isPreviewing = previewScheduleId === s.id;
                  return (
                    <div
                      key={idx}
                      className={`text-[9px] px-1.5 py-0.5 rounded mb-0.5 truncate transition-all ${
                        isPreviewing
                          ? 'bg-blue-600 text-white font-medium ring-1 ring-white/30'
                          : allUploaded
                            ? 'bg-emerald-900/50 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-300'
                      }`}
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
            {selected.items.map((s) => {
              const sst = STATUS_STYLE[s.status];
              const allUploaded = s.schedule_platforms?.every(p => p.is_uploaded);
              const isPreviewing = previewScheduleId === s.id;
              return (
                <div key={s.id} className="py-3 first:pt-0 last:pb-0">

                  {/* Judul + waktu + aksi preview & status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      allUploaded ? 'bg-emerald-400' : 'bg-zinc-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{s.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{toTimeStr(s.scheduled_for)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectPreviewSchedule && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelectPreviewSchedule(s); }}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isPreviewing
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                          }`}
                          title="Tampilkan pratinjau jadwal ini di Live Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isPreviewing ? 'Pratinjau Aktif' : 'Pratinjau'}
                        </button>
                      )}

                      {onLoadIntoForm && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onLoadIntoForm(s); }}
                          className="px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                          title="Muat isi jadwal ini ke form"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Salin ke Form
                        </button>
                      )}

                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: sst.bg, color: sst.tc }}
                      >
                        {sst.label}
                      </span>
                    </div>
                  </div>

                  {/* Checklist platform */}
                  <div className="flex flex-col gap-1.5 pl-5">
                    {PLATFORMS.map(platform => {
                      const sp = s.schedule_platforms?.find(p => p.platform === platform);
                      if (!sp) return null;
                      const st = PLATFORM_STYLE[platform];
                      const isToggling = toggling === sp.id;
                      return (
                        <button
                          key={platform}
                          onClick={(e) => { e.stopPropagation(); handleToggle(sp, s.id); }}
                          disabled={isToggling}
                          className="flex items-center gap-2.5 w-full text-left disabled:opacity-50 transition-opacity"
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                              sp.is_uploaded ? 'border-transparent' : 'border-zinc-600 bg-transparent'
                            }`}
                            style={sp.is_uploaded ? { background: st.color } : {}}
                          >
                            {sp.is_uploaded && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>

                          {/* Label platform */}
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: st.bg, color: st.tc }}
                          >
                            {platform}
                          </span>

                          {/* Waktu upload */}
                          {sp.is_uploaded && sp.uploaded_at && (
                            <span className="text-[10px] text-zinc-500 ml-auto">
                              {new Date(sp.uploaded_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </button>
                      );
                    })}
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