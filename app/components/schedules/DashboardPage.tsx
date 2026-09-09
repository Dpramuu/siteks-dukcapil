'use client';

import { PLATFORM_STYLE, STATUS_STYLE, MONTHS, type Platform, type ScheduleStatus } from '@/app/components/schedules/types';

type UpcomingSchedule = {
  id: string;
  title: string;
  status: ScheduleStatus;
  scheduled_for: string;
  schedule_platforms: { platform: Platform; is_uploaded: boolean }[];
};

type Props = {
  stats: {
    totalKonten: number;
    terjadwal:   number;
    terbit:      number;
  };
  platformCount:     Record<string, number>;
  monthlyCount:      number[];
  upcomingSchedules: UpcomingSchedule[];
};

const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'Twitter'];

export default function DashboardPage({
  stats,
  platformCount,
  monthlyCount,
  upcomingSchedules,
}: Props) {

  const statCards = [
    { label: 'Total Konten', value: String(stats.totalKonten), sub: 'semua waktu' },
    { label: 'Terjadwal',    value: String(stats.terjadwal),   sub: 'belum tayang' },
    { label: 'Terbit',       value: String(stats.terbit),      sub: 'sudah tayang' },
  ];

  const maxMonth    = Math.max(...monthlyCount, 1);
  const barHeights  = monthlyCount.map(v => Math.round((v / maxMonth) * 100));
  const maxPlatform = Math.max(...PLATFORMS.map(p => platformCount[p] ?? 0), 1);

  const formatScheduledFor = (iso: string) => {
    const d        = new Date(iso);
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getDate()     === b.getDate()  &&
      a.getMonth()    === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (isSameDay(d, now))      return `Hari ini · ${timeStr}`;
    if (isSameDay(d, tomorrow)) return `Besok · ${timeStr}`;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${timeStr}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium text-white">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {MONTHS[new Date().getMonth()]} {new Date().getFullYear()} · Ringkasan konten kamu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="text-2xl font-medium text-white mt-1">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3">

        {/* Bar chart aktivitas bulanan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Aktivitas konten</p>
          <div className="flex items-end gap-1 h-20">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height:     `${Math.max(h, 4)}%`,
                  background: i === new Date().getMonth() ? '#185FA5' : '#378ADD',
                  opacity:    h === 0 ? 0.2 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {MONTHS.map(m => (
              <div key={m} className="flex-1 text-center text-[9px] text-zinc-500">
                {m.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart per platform */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Konten per platform</p>
          <div className="flex flex-col gap-3">
            {PLATFORMS.map(p => {
              const count = platformCount[p] ?? 0;
              const pct   = Math.round((count / maxPlatform) * 100);
              const st    = PLATFORM_STYLE[p];
              return (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-20">{p}</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, background: st.color }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Jadwal terdekat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm font-medium text-white mb-3">Jadwal terdekat</p>
        {upcomingSchedules.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">Tidak ada jadwal yang akan datang.</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800">
            {upcomingSchedules.map(s => {
              const sst = STATUS_STYLE[s.status];
              return (
                <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-zinc-500" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">{s.title}</p>
                    <p className="text-xs text-zinc-500">{formatScheduledFor(s.scheduled_for)}</p>
                    {/* Platform badges + status upload */}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {s.schedule_platforms?.map(sp => {
                        const st = PLATFORM_STYLE[sp.platform];
                        return (
                          <span
                            key={sp.platform}
                            className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              background: sp.is_uploaded ? st.bg : '#27272a',
                              color:      sp.is_uploaded ? st.tc : '#71717a',
                            }}
                          >
                            {sp.is_uploaded && (
                              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {sp.platform}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: sst.bg, color: sst.tc }}
                  >
                    {sst.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}