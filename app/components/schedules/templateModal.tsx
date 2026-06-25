'use client';

import { PLATFORM_STYLE, type Template } from './types';

type Props = {
  templates: Template[];
  onSelect: (t: Template) => void;
  onClose: () => void;
};

export default function TemplateModal({ templates, onSelect, onClose }: Props) {
  return (
    <div className="bg-black/60 rounded-xl p-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">Pilih Template</p>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Grid template */}
        <div className="grid grid-cols-2 gap-3">
          {templates.map(t => {
            const st = PLATFORM_STYLE[t.platform];
            return (
              <div
                key={t.id}
                onClick={() => onSelect(t)}
                className="border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 rounded-lg p-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-white">{t.name}</p>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
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
          })}
        </div>

      </div>
    </div>
  );
}