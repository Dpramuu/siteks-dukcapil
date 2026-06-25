'use client';

import { type Platform } from './types';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  platform: Platform;
  setPlatform: (v: Platform) => void;
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
  caption: string;
  setCaption: (v: string) => void;
  successMsg: boolean;
  onSave: () => void;
  onOpenTemplates: () => void;
};

export default function ScheduleForm({
  title, setTitle,
  platform, setPlatform,
  scheduledFor, setScheduledFor,
  caption, setCaption,
  successMsg,
  onSave,
  onOpenTemplates,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-4">Tambah jadwal baru</p>

      {successMsg && (
        <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          Jadwal berhasil disimpan!
        </div>
      )}

      <div className="flex flex-col gap-3">

        {/* Judul */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Judul konten</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600"
            placeholder="Nama konten..."
          />
        </div>

        {/* Tanggal & waktu */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Tanggal & waktu</label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={e => setScheduledFor(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Platform</label>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value as Platform)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
          >
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter">Twitter</option>
          </select>
        </div>

        {/* Caption + Tombol Template */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-400">Caption</label>
            <button
              onClick={onOpenTemplates}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              Pilih Template
            </button>
          </div>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
            placeholder="Tulis caption di sini..."
          />
        </div>

        {/* Submit */}
        <button
          onClick={onSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Simpan Jadwal
        </button>

      </div>
    </div>
  );
}