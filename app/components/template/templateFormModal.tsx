import { useState } from 'react';
import type { Template, Platform } from './types';

type Props = {
  initial?: Template | null;
  onSave: (data: { name: string; platform: Platform; content: string }) => void;
  onClose: () => void;
};

export default function TemplateFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName]         = useState(initial?.name ?? '');
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? 'Instagram');
  const [content, setContent]   = useState(initial?.content ?? '');

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      alert('Nama dan isi caption wajib diisi!');
      return;
    }
    onSave({ name: name.trim(), platform, content: content.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">
            {initial ? 'Edit template' : 'Buat template baru'}
          </p>
          <button onClick={onClose} aria-label="Tutup modal"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Nama template</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600"
              placeholder="Contoh: Promo Mingguan..." />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600">
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Twitter">Twitter</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Isi caption</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none leading-relaxed"
              placeholder="Tulis caption template..." />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Batal
            </button>
            <button onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium transition-colors">
              {initial ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}