'use client';

import { useState } from 'react';
import { PLATFORM_STYLE, type Template } from './types';

type Props = {
  templates: Template[];
  onSelect: (t: Template) => void;
  onClose: () => void;
};

export default function TemplateModal({ templates, onSelect, onClose }: Props) {
  // 1. Tambahkan state untuk query pencarian
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Filter template berdasarkan nama atau konten (case-insensitive)
  const filteredTemplates = templates.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query) ||
      t.platform.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-sm font-medium text-white">Pilih Template</p>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* 3. Input Pencarian */}
        <div className="mb-4 shrink-0">
          <input
            type="text"
            placeholder="Cari template berdasarkan nama atau platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Grid template — menggunakan filteredTemplates */}
        <div className="overflow-y-auto grid grid-cols-2 gap-3 pr-1">
          {filteredTemplates.length === 0 ? (
            <p className="text-xs text-zinc-500 col-span-2 text-center py-8">
              {templates.length === 0 
                ? "Belum ada template tersedia." 
                : "Tidak ada template yang cocok dengan pencarian."}
            </p>
          ) : (
            filteredTemplates.map(t => {
              const st = PLATFORM_STYLE[t.platform];
              return (
                <div
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className="border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 rounded-lg p-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-white truncate mr-2">{t.name}</p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: st.bg, color: st.tc }}
                    >
                      {t.platform}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {t.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}