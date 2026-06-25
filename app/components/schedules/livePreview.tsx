'use client';

import { type Platform } from './types';

type Props = {
  platform: Platform;
  caption: string;
};

const ICON_PATHS = [
  'M 20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
];

export default function LivePreview({ platform, caption }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-4">Live preview</p>
      <div className="bg-black rounded-xl overflow-hidden">

        {/* Header profil */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
            P
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-white leading-none">Pramudya</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{platform}</p>
          </div>
          <span className="text-white text-base leading-none">···</span>
        </div>

        {/* Placeholder image */}
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
            <p className="text-xs text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
              {caption}
            </p>
          ) : (
            <p className="text-xs text-zinc-600 italic">Caption akan muncul di sini...</p>
          )}
        </div>

        {/* Action icons */}
        <div className="flex gap-3.5 px-3 pb-3 border-t border-zinc-800 pt-2">
          {ICON_PATHS.map((p, i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
              <path d={p}/>
            </svg>
          ))}
        </div>

      </div>
    </div>
  );
}