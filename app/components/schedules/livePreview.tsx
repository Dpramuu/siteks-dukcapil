'use client';

import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Music2,
  MoreHorizontal,
  Share2,
  ImageIcon,
  Eye,
} from 'lucide-react';
import { type Platform } from './types';

type Props = {
  platform: Platform;
  setPlatform?: (p: Platform) => void;
  title: string;
  caption: string;
  previewSource?: 'form' | 'calendar';
  scheduleTitle?: string;
  onResetToForm?: () => void;
};

export default function LivePreview({
  platform,
  setPlatform,
  title,
  caption,
  previewSource = 'form',
  scheduleTitle,
  onResetToForm,
}: Props) {
  const displayText = caption.trim() || title.trim();
  const hasContent = Boolean(displayText);

  return (
    <div id="live-preview-section" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col h-full scroll-mt-6">
      {/* Banner informasi jika preview berasal dari klik kalender */}
      {previewSource === 'calendar' && (
        <div className="flex items-center justify-between px-3 py-2 bg-blue-950/60 border border-blue-500/40 rounded-xl text-xs text-blue-200 mb-3.5 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
            <Eye className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              Pratinjau jadwal kalender: <b className="text-white font-semibold">{scheduleTitle || title}</b>
            </span>
          </div>
          {onResetToForm && (
            <button
              type="button"
              onClick={onResetToForm}
              className="text-[11px] bg-blue-600/40 hover:bg-blue-600/70 text-blue-100 px-2.5 py-1 rounded-lg transition-colors ml-2 shrink-0 font-medium border border-blue-400/30"
            >
              Kembali ke Form
            </button>
          )}
        </div>
      )}

      {/* Header bar preview dengan switch platform */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <p className="text-sm font-medium text-white">Live Preview</p>
          <p className="text-[11px] text-zinc-500">Pratinjau tampilan real-time di media sosial</p>
        </div>

        {/* Tab ganti platform cepat */}
        {setPlatform && (
          <div className="flex bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/60 text-xs">
            {(['Instagram', 'TikTok', 'Twitter'] as Platform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  platform === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p === 'Twitter' ? 'X / Twitter' : p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Konten Preview Berdasarkan Platform */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">

          {/* =========================================
              1. INSTAGRAM FEED PREVIEW
             ========================================= */}
          {platform === 'Instagram' && (
            <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header Post */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                      D
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">dukcapil_official</p>
                    <p className="text-[10px] text-zinc-500">Indonesia</p>
                  </div>
                </div>
                <button type="button" className="text-zinc-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Media Container */}
              <div className="w-full aspect-square bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center relative p-6 text-center border-y border-zinc-900">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-3 shadow-inner">
                  <ImageIcon className="w-7 h-7 text-zinc-500" />
                </div>
                {title ? (
                  <p className="text-sm font-semibold text-zinc-200 line-clamp-2 max-w-[85%]">{title}</p>
                ) : (
                  <p className="text-xs text-zinc-500">Area Visual Konten</p>
                )}
                <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-zinc-400 font-mono">
                  1/1
                </span>
              </div>

              {/* Action Bar */}
              <div className="px-3.5 pt-3 pb-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-white hover:text-rose-500 transition-colors cursor-pointer" />
                    <MessageCircle className="w-5 h-5 text-white -rotate-90 cursor-pointer" />
                    <Send className="w-5 h-5 text-white cursor-pointer" />
                  </div>
                  <Bookmark className="w-5 h-5 text-white cursor-pointer" />
                </div>
                <p className="text-[11px] font-semibold text-white mb-1.5">1.248 suka</p>

                {/* Caption Text */}
                <div className="text-xs text-zinc-200 leading-relaxed max-h-36 overflow-y-auto">
                  <span className="font-semibold text-white mr-1.5">dukcapil_official</span>
                  {hasContent ? (
                    <span className="whitespace-pre-wrap">{displayText}</span>
                  ) : (
                    <span className="text-zinc-600 italic">Ketik judul atau caption untuk melihat pratinjau...</span>
                  )}
                </div>

                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-2 pb-2">
                  Baru saja · Diterbitkan
                </p>
              </div>
            </div>
          )}

          {/* =========================================
              2. TWITTER / X PREVIEW
             ========================================= */}
          {platform === 'Twitter' && (
            <div className="bg-black border border-zinc-800 rounded-2xl p-4 shadow-2xl">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  D
                </div>

                {/* Tweet Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-xs font-bold text-white truncate">Dukcapil Prima</span>
                      <span className="text-xs text-zinc-500 truncate">@dukcapil</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500 shrink-0">Baru saja</span>
                    </div>
                    <button type="button" className="text-zinc-500 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Caption */}
                  <div className="mt-2 text-xs text-zinc-200 leading-relaxed max-h-48 overflow-y-auto">
                    {title && <p className="font-semibold text-white mb-1">{title}</p>}
                    {caption ? (
                      <p className="whitespace-pre-wrap">{caption}</p>
                    ) : !title ? (
                      <p className="text-zinc-600 italic">Ketik judul atau caption untuk melihat tweet...</p>
                    ) : null}
                  </div>

                  {/* Attachment Box Placeholder */}
                  <div className="mt-3 w-full h-36 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-center justify-center text-zinc-500 text-xs">
                    <ImageIcon className="w-6 h-6 mb-1 text-zinc-600" />
                    <span>Media lampiran postingan</span>
                  </div>

                  {/* Tweet Interactions */}
                  <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-zinc-900 text-zinc-500 text-[11px]">
                    <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                      <MessageCircle className="w-4 h-4" />
                      <span>24</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                      <Repeat2 className="w-4 h-4" />
                      <span>12</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer">
                      <Heart className="w-4 h-4" />
                      <span>158</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                      <BarChart2 className="w-4 h-4" />
                      <span>3,4 rb</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 hover:text-blue-400 cursor-pointer" />
                      <Share2 className="w-4 h-4 hover:text-blue-400 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              3. TIKTOK PREVIEW
             ========================================= */}
          {platform === 'TikTok' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative aspect-[9/14] flex flex-col justify-between p-3.5 select-none">
              {/* Background Video Simulation */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center -z-0">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-2">
                  <Music2 className="w-8 h-8 text-zinc-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-zinc-500">Pratinjau Video TikTok (9:16)</p>
              </div>

              {/* Top Navigation */}
              <div className="relative z-10 flex items-center justify-center gap-4 text-xs font-semibold text-zinc-400 pt-1">
                <span className="cursor-pointer hover:text-white">Mengikuti</span>
                <span className="text-white border-b-2 border-white pb-0.5">Untuk Anda</span>
              </div>

              {/* Right Floating Actions */}
              <div className="relative z-10 self-end flex flex-col items-center gap-3.5 mr-0.5">
                {/* Creator Avatar with follow badge */}
                <div className="relative mb-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                      D
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                    +
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/60 backdrop-blur-md flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white font-medium mt-0.5">42,5K</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/60 backdrop-blur-md flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white font-medium mt-0.5">832</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/60 backdrop-blur-md flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white font-medium mt-0.5">3.120</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/60 backdrop-blur-md flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white font-medium mt-0.5">Bagikan</span>
                </div>

                {/* Rotating Music Disc */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                </div>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="relative z-10 max-w-[82%] text-white text-xs leading-relaxed">
                <p className="font-bold text-sm mb-1 drop-shadow">@dukcapil_official</p>
                <div className="max-h-24 overflow-y-auto pr-1">
                  {hasContent ? (
                    <p className="drop-shadow-md whitespace-pre-wrap">{displayText}</p>
                  ) : (
                    <p className="text-zinc-400 italic text-[11px]">Ketik judul atau caption untuk melihat teks TikTok...</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-300 font-medium">
                  <Music2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Suara Asli - Dukcapil Menyapa</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}