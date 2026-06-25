'use client';

import { useState, useEffect } from 'react';

// ── Types ──
type Platform = 'Instagram' | 'TikTok' | 'Twitter';
type FilterType = 'all' | Platform;

type Schedule = {
  id?: string;
  date: string;
  title: string;
  platform: Platform;
  time: string;
  caption: string;
};

type Template = {
  id: string;
  name: string;
  content: string;
  platform: Platform;
};

// ── Constants ──
const PLATFORM_STYLE: Record<Platform, { color: string; bg: string; tc: string }> = {
  Instagram: { color: '#185FA5', bg: '#E6F1FB', tc: '#185FA5' },
  TikTok:    { color: '#D4537E', bg: '#FBEAF0', tc: '#993556' },
  Twitter:   { color: '#1D9E75', bg: '#E1F5EE', tc: '#0F6E56' },
};

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];
const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'TikTok', value: 'TikTok' },
  { label: 'Twitter', value: 'Twitter' },
];

// ── Dummy data (ganti dengan fetch Supabase) ──
const DUMMY_SCHEDULES: Schedule[] = [
  { date:'2026-05-01', title:'Promo Mei',        platform:'Instagram', time:'10:00', caption:'Promo spesial bulan Mei! #promo #sale' },
  { date:'2026-05-05', title:'Tutorial produk',   platform:'TikTok',    time:'15:00', caption:'Tutorial lengkap produk terbaru' },
  { date:'2026-05-07', title:'Behind the scenes', platform:'Instagram', time:'11:00', caption:'Di balik layar pembuatan konten' },
  { date:'2026-05-12', title:'Q&A Twitter',        platform:'Twitter',   time:'20:00', caption:'Sesi tanya jawab bareng kalian' },
  { date:'2026-05-14', title:'Konten kolaborasi',  platform:'Instagram', time:'08:00', caption:'Kolaborasi seru bersama partner' },
  { date:'2026-05-14', title:'Dance challenge',    platform:'TikTok',    time:'16:00', caption:'Join dance challenge terbaru!' },
  { date:'2026-05-20', title:'Unboxing video',     platform:'TikTok',    time:'17:00', caption:'Unboxing produk edisi terbatas' },
  { date:'2026-05-24', title:'Weekend vibes',      platform:'Instagram', time:'09:00', caption:'Weekend mood on point!' },
];

const DUMMY_TEMPLATES: Template[] = [
  { id:'1', name:'Promo Produk',       platform:'Instagram', content:'Dapatkan penawaran terbaik hari ini! Produk kami hadir dengan kualitas premium dan harga terjangkau. Jangan sampai ketinggalan! #promo #sale' },
  { id:'2', name:'Motivasi Pagi',      platform:'Twitter',   content:'Selamat pagi! Mulai harimu dengan semangat dan tekad yang kuat. Setiap langkah kecil membawa kita lebih dekat ke tujuan. #motivasi' },
  { id:'3', name:'Behind The Scenes',  platform:'Instagram', content:'Di balik layar pembuatan konten ini, ada banyak proses kreatif yang menarik. Yuk intip perjalanannya! #bts #konten' },
  { id:'4', name:'Tips & Trik',        platform:'TikTok',    content:'Tips hari ini: konsistensi adalah kunci sukses di media sosial. Posting rutin dan jaga kualitas kontenmu! #tips #socialmedia' },
];

// ── Main Component ──
export default function SchedulePage() {
  const today = new Date();

  // Calendar state
  const [cur, setCur]           = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter]     = useState<FilterType>('all');
  const [selected, setSelected] = useState<{ date: string; items: Schedule[] } | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>(DUMMY_SCHEDULES);

  // Form state
  const [title, setTitle]             = useState('');
  const [platform, setPlatform]       = useState<Platform>('Instagram');
  const [scheduledFor, setScheduledFor] = useState('');
  const [caption, setCaption]         = useState('');
  const [successMsg, setSuccessMsg]   = useState(false);

  // Modal + templates state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates]     = useState<Template[]>([]);

  // Fetch templates (ganti dengan Supabase)
  useEffect(() => {
    // TODO: const { data } = await supabase.from('templates').select('*');
    setTemplates(DUMMY_TEMPLATES);
  }, []);

  // Calendar helpers
  const y = cur.getFullYear();
  const m = cur.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const filtered = filter === 'all' ? schedules : schedules.filter(s => s.platform === filter);

  const getDateStr = (d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isToday = (d: number) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  // Form handlers
  const handleInjectTemplate = (t: Template) => {
    setCaption(t.content);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!title || !scheduledFor) {
      alert('Judul dan tanggal wajib diisi!');
      return;
    }
    const d = new Date(scheduledFor);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

    const newSchedule: Schedule = { date: dateStr, title, platform, time: timeStr, caption };

    // TODO: await supabase.from('schedules').insert([newSchedule]);
    setSchedules(prev => [...prev, newSchedule]);

    // Reset form
    setTitle(''); setScheduledFor(''); setCaption('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header + Filter ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Schedule</h1>
          <p className="text-xs text-zinc-500 mt-1">{MONTHS[m]} {y} · Kelola jadwal konten</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setSelected(null); }}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                filter === f.value
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Nav Bulan ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => { setCur(new Date(y, m-1, 1)); setSelected(null); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors">‹</button>
        <span className="text-sm font-medium text-white">{MONTHS[m]} {y}</span>
        <button onClick={() => { setCur(new Date(y, m+1, 1)); setSelected(null); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors">›</button>
      </div>

      {/* ── Kalender ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {DAYS.map(d => <div key={d} className="py-2 text-center text-xs text-zinc-500 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="min-h-16 border-r border-b border-zinc-800 bg-zinc-950" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const dateStr = getDateStr(d);
            const dayScheds = filtered.filter(s => s.date === dateStr);
            const col = (firstDay + i) % 7;
            return (
              <div key={d} onClick={() => dayScheds.length && setSelected({ date: dateStr, items: dayScheds })}
                className={`min-h-16 p-1.5 border-b border-zinc-800 transition-colors
                  ${col < 6 ? 'border-r border-zinc-800' : ''}
                  ${dayScheds.length ? 'cursor-pointer hover:bg-zinc-800/50' : 'cursor-default'}
                  ${selected?.date === dateStr ? 'bg-zinc-800/50' : ''}
                `}>
                <div className={`w-5 h-5 flex items-center justify-center text-xs mb-1 rounded-full
                  ${isToday(d) ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400'}`}>
                  {d}
                </div>
                {dayScheds.slice(0, 2).map((s, idx) => {
                  const st = PLATFORM_STYLE[s.platform];
                  return (
                    <div key={idx} className="text-[9px] px-1.5 py-0.5 rounded mb-0.5 truncate"
                      style={{ background: st.bg, color: st.tc }}>{s.title}</div>
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
              {parseInt(selected.date.split('-')[2])} {MONTHS[parseInt(selected.date.split('-')[1])-1]} {selected.date.split('-')[0]}
            </p>
            <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-800">
            {selected.items.map((s, i) => {
              const st = PLATFORM_STYLE[s.platform];
              return (
                <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: st.color }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">{s.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.time}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{ background: st.bg, color: st.tc }}>{s.platform}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Form + Live Preview ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Kiri: Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-4">Tambah jadwal baru</p>

          {successMsg && (
            <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              Jadwal berhasil disimpan!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Judul konten</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600"
                placeholder="Nama konten..." />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tanggal & waktu</label>
              <input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600" />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600">
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitter">Twitter</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-400">Caption</label>
                <button onClick={() => setIsModalOpen(true)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors">
                  Pilih Template
                </button>
              </div>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
                placeholder="Tulis caption di sini..." />
            </div>

            <button onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Simpan Jadwal
            </button>
          </div>
        </div>

        {/* Kanan: Live Preview Instagram */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-4">Live preview</p>
          <div className="bg-black rounded-xl overflow-hidden">
            {/* Header profil */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white shrink-0">P</div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white leading-none">Pramudya</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{platform}</p>
              </div>
              <span className="text-white text-base leading-none">···</span>
            </div>
            {/* Dummy image */}
            <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            {/* Caption */}
            <div className="px-3 py-2.5">
              {caption ? (
                <p className="text-xs text-white leading-relaxed whitespace-pre-wrap wrap-break-word">{caption}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">Caption akan muncul di sini...</p>
              )}
            </div>
            {/* Footer actions */}
            <div className="flex gap-3.5 px-3 pb-3 border-t border-zinc-800 pt-2">
              {['M 20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
                'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z'].map((p, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                  <path d={p}/>
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Pilih Template ── */}
      {isModalOpen && (
        <div className="bg-black/60 rounded-xl p-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white">Pilih Template</p>
              <button onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white text-lg leading-none transition-colors">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map(t => {
                const st = PLATFORM_STYLE[t.platform];
                return (
                  <div key={t.id} onClick={() => handleInjectTemplate(t)}
                    className="border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 rounded-lg p-3 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-white">{t.name}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.tc }}>{t.platform}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{t.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}