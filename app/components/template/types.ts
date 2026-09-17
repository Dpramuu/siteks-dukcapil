// // ── Types ──
// export type Platform = 'Instagram' | 'TikTok' | 'Twitter';
// export type FilterType = 'all' | Platform;

// export type Schedule = {
//   id?: string;
//   date: string;
//   title: string;
//   platform: Platform;
//   time: string;
//   caption: string;
// };

// export type Template = {
//   id: string;
//   name: string;
//   content: string;
//   platform: Platform;
// };

// // ── Constants ──
// export const PLATFORM_STYLE: Record<Platform, { color: string; bg: string; tc: string }> = {
//   Instagram: { color: '#185FA5', bg: '#E6F1FB', tc: '#185FA5' },
//   TikTok:    { color: '#D4537E', bg: '#FBEAF0', tc: '#993556' },
//   Twitter:   { color: '#1D9E75', bg: '#E1F5EE', tc: '#0F6E56' },
// };

// export const MONTHS = [
//   'Januari','Februari','Maret','April','Mei','Juni',
//   'Juli','Agustus','September','Oktober','November','Desember',
// ];

// export const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

// export const FILTERS: { label: string; value: FilterType }[] = [
//   { label: 'Semua',     value: 'all' },
//   { label: 'Instagram', value: 'Instagram' },
//   { label: 'TikTok',   value: 'TikTok' },
//   { label: 'Twitter',  value: 'Twitter' },
// ];

// ── Dummy data ──
// export const DUMMY_SCHEDULES: Schedule[] = [
//   { date:'2026-05-01', title:'Promo Mei',        platform:'Instagram', time:'10:00', caption:'Promo spesial bulan Mei! #promo #sale' },
//   { date:'2026-05-05', title:'Tutorial produk',   platform:'TikTok',    time:'15:00', caption:'Tutorial lengkap produk terbaru' },
//   { date:'2026-05-07', title:'Behind the scenes', platform:'Instagram', time:'11:00', caption:'Di balik layar pembuatan konten' },
//   { date:'2026-05-12', title:'Q&A Twitter',        platform:'Twitter',   time:'20:00', caption:'Sesi tanya jawab bareng kalian' },
//   { date:'2026-05-14', title:'Konten kolaborasi',  platform:'Instagram', time:'08:00', caption:'Kolaborasi seru bersama partner' },
//   { date:'2026-05-14', title:'Dance challenge',    platform:'TikTok',    time:'16:00', caption:'Join dance challenge terbaru!' },
//   { date:'2026-05-20', title:'Unboxing video',     platform:'TikTok',    time:'17:00', caption:'Unboxing produk edisi terbatas' },
//   { date:'2026-05-24', title:'Weekend vibes',      platform:'Instagram', time:'09:00', caption:'Weekend mood on point!' },
// ];

// export const DUMMY_TEMPLATES: Template[] = [
//   { id:'1', name:'Promo Produk',      platform:'Instagram', content:'Dapatkan penawaran terbaik hari ini! Produk kami hadir dengan kualitas premium dan harga terjangkau. Jangan sampai ketinggalan! #promo #sale' },
//   { id:'2', name:'Motivasi Pagi',     platform:'Twitter',   content:'Selamat pagi! Mulai harimu dengan semangat dan tekad yang kuat. Setiap langkah kecil membawa kita lebih dekat ke tujuan. #motivasi' },
//   { id:'3', name:'Behind The Scenes', platform:'Instagram', content:'Di balik layar pembuatan konten ini, ada banyak proses kreatif yang menarik. Yuk intip perjalanannya! #bts #konten' },
//   { id:'4', name:'Tips & Trik',       platform:'TikTok',    content:'Tips hari ini: konsistensi adalah kunci sukses di media sosial. Posting rutin dan jaga kualitas kontenmu! #tips #socialmedia' },
// ];

// ── Platform ──
export type Platform = 'Instagram' | 'TikTok' | 'Twitter';

// ── Schedule ──
export type ScheduleStatus = 'draft' | 'scheduled' | 'published';

export type Schedule = {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  caption: string;
  platform: Platform;
  status: ScheduleStatus;
  scheduled_for: string; // Format tanggal/waktu dari MySQL
  created_at: string;
  updated_at: string;
};

export type ScheduleInsert = {
  template_id?: string | null;
  title: string;
  caption: string;
  platform: Platform;
  status: ScheduleStatus;
  scheduled_for: string;
};

// ── Template ──
export type Template = {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  content: string;
  created_at: string;
  updated_at: string;
};

export type TemplateInsert = {
  name: string;
  platform: Platform;
  content: string;
};

export type TemplateUpdate = Partial<TemplateInsert>;

// ── UI helpers ──
export const PLATFORM_STYLE: Record<Platform, { color: string; bg: string; tc: string }> = {
  Instagram: { color: '#185FA5', bg: '#E6F1FB', tc: '#185FA5' },
  TikTok:    { color: '#D4537E', bg: '#FBEAF0', tc: '#993556' },
  Twitter:   { color: '#1D9E75', bg: '#E1F5EE', tc: '#0F6E56' },
};

export const STATUS_STYLE: Record<ScheduleStatus, { bg: string; tc: string; label: string }> = {
  draft:     { bg: '#27272a', tc: '#a1a1aa', label: 'Draft' },
  scheduled: { bg: '#1e3a5f', tc: '#60a5fa', label: 'Scheduled' },
  published: { bg: '#14532d', tc: '#4ade80', label: 'Published' },
};

export const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
export const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];