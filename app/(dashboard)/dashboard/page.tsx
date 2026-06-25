'use client';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Konten', value: '48', sub: '+12 bulan ini' },
    { label: 'Terjadwal', value: '14', sub: 'minggu ini' },
    { label: 'Terbit', value: '34', sub: 'sudah tayang' },
  ];

  const platforms = [
    { name: 'Instagram', count: 19, pct: 80, color: '#378ADD' },
    { name: 'Twitter/X', count: 13, pct: 55, color: '#1D9E75' },
    { name: 'TikTok', count: 9, pct: 40, color: '#D4537E' },
    { name: 'YouTube', count: 7, pct: 30, color: '#EF9F27' },
  ];

  const schedules = [
    { title: 'Postingan Instagram — Promo Mei', time: 'Hari ini · 14:00', platform: 'Instagram', color: '#378ADD', bg: '#E6F1FB', text: '#185FA5' },
    { title: 'TikTok video — Tutorial produk', time: 'Besok · 09:00', platform: 'TikTok', color: '#D4537E', bg: '#FBEAF0', text: '#993556' },
    { title: 'Thread Twitter — Tips konten', time: '22 Mei · 11:00', platform: 'Twitter/X', color: '#1D9E75', bg: '#E1F5EE', text: '#0F6E56' },
  ];

  const bars = [30, 50, 40, 70, 55, 80, 60, 90, 45, 65, 35, 75];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium text-white">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-1">Mei 2026 · Ringkasan konten kamu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="text-2xl font-medium text-white mt-1">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bar chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Aktivitas konten</p>
          <div className="flex items-end gap-1 h-20">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${h}%`, background: i === 7 ? '#185FA5' : '#378ADD' }}
              />
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {months.map((m) => (
              <div key={m} className="flex-1 text-center text-[9px] text-zinc-500">{m}</div>
            ))}
          </div>
        </div>

        {/* Platform bars */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Konten per platform</p>
          <div className="flex flex-col gap-3">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-20">{p.name}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
                <span className="text-xs text-zinc-400 w-6 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm font-medium text-white mb-3">Jadwal terdekat</p>
        <div className="flex flex-col divide-y divide-zinc-800">
          {schedules.map((s) => (
            <div key={s.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="flex-1">
                <p className="text-xs font-medium text-white">{s.title}</p>
                <p className="text-xs text-zinc-500">{s.time}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
                {s.platform}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}