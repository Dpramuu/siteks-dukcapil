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
} from 'lucide-react';

import { PLATFORMS, type Platform } from './types';
import { PLATFORM_LIMIT } from './meta';

type Props = {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  title: string;
  caption: string;
  photo?: string | null;
};

const EMPTY = 'Ketik judul atau caption untuk melihat pratinjau…';

export default function LivePreview({
  platform,
  setPlatform,
  title,
  caption,
  photo,
}: Props) {
  const text = caption.trim() || title.trim();
  const limit = PLATFORM_LIMIT[platform];
  const count = caption.trim().length;
  const over = count > limit;

  return (
    <div className="flex flex-col gap-4">
      {/* Pilih platform */}
      <div
        role="group"
        aria-label="Pratinjau untuk platform"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1"
      >
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            aria-pressed={platform === p}
            className={`cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              platform === p
                ? 'bg-ink text-bg'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {p === 'Twitter' ? 'X / Twitter' : p}
          </button>
        ))}
      </div>

      {/* Mockup */}
      <div className="mx-auto w-full max-w-sm">
        {platform === 'Instagram' && (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-tight text-ink">
                  akun_anda
                </p>
                <p className="text-[10px] text-muted">Indonesia</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted" />
            </div>

            <div className="relative flex aspect-square items-center justify-center bg-bg">
              {photo ? (
                <img
                  src={photo}
                  alt="Pratinjau foto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex max-w-[80%] flex-col items-center gap-2 text-center">
                  <ImageIcon className="h-8 w-8 text-muted" />
                  <p className="line-clamp-2 text-sm font-medium text-ink-soft">
                    {title || 'Area visual konten'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-3.5 pb-3.5 pt-3">
              <div className="mb-2 flex items-center justify-between text-ink">
                <div className="flex items-center gap-4">
                  <Heart className="h-5 w-5" />
                  <MessageCircle className="h-5 w-5 -rotate-90" />
                  <Send className="h-5 w-5" />
                </div>
                <Bookmark className="h-5 w-5" />
              </div>
              <p className="mb-1 text-[11px] font-semibold text-ink">
                1.248 suka
              </p>
              <div className="max-h-32 overflow-y-auto text-xs leading-relaxed text-ink-soft">
                <span className="mr-1.5 font-semibold text-ink">akun_anda</span>
                {text ? (
                  <span className="whitespace-pre-wrap">{text}</span>
                ) : (
                  <span className="italic text-muted">{EMPTY}</span>
                )}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted">
                Baru saja
              </p>
            </div>
          </div>
        )}

        {platform === 'Twitter' && (
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                A
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 overflow-hidden text-xs">
                  <span className="truncate font-bold text-ink">Akun Anda</span>
                  <span className="truncate text-muted">@akun_anda</span>
                  <span className="text-muted">·</span>
                  <span className="shrink-0 text-muted">Baru saja</span>
                </div>

                <div className="mt-2 max-h-44 overflow-y-auto text-xs leading-relaxed text-ink-soft">
                  {title && (
                    <p className="mb-1 font-semibold text-ink">{title}</p>
                  )}
                  {caption ? (
                    <p className="whitespace-pre-wrap">{caption}</p>
                  ) : !title ? (
                    <p className="italic text-muted">{EMPTY}</p>
                  ) : null}
                </div>

                <div className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-bg text-xs text-muted">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Pratinjau lampiran"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <ImageIcon className="h-6 w-6" />
                      Media lampiran
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    24
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat2 className="h-4 w-4" />
                    12
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    158
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4" />
                    3,4 rb
                  </span>
                  <span className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    <Share2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {platform === 'TikTok' && (
          <div className="relative mx-auto flex aspect-[9/14] w-full max-w-[270px] select-none flex-col justify-between overflow-hidden rounded-3xl border border-line bg-black p-3.5 text-white shadow-sm">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 via-black to-zinc-950">
              {photo ? (
                <img
                  src={photo}
                  alt="Pratinjau TikTok"
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
              ) : (
                <>
                  <Music2 className="h-8 w-8 text-zinc-500" />
                  <p className="mt-2 text-[11px] text-zinc-500">
                    Video 9:16
                  </p>
                </>
              )}
            </div>

            <div className="relative z-10 flex items-center justify-center gap-4 pt-1 text-xs font-semibold text-zinc-400">
              <span>Mengikuti</span>
              <span className="border-b-2 border-white pb-0.5 text-white">
                Untuk Anda
              </span>
            </div>

            <div className="relative z-10 flex items-end justify-between gap-2">
              <div className="min-w-0 max-w-[78%] text-xs leading-relaxed">
                <p className="mb-1 text-sm font-bold drop-shadow">@akun_anda</p>
                <div className="max-h-24 overflow-y-auto">
                  {text ? (
                    <p className="whitespace-pre-wrap drop-shadow-md">{text}</p>
                  ) : (
                    <p className="text-[11px] italic text-zinc-400">{EMPTY}</p>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <Music2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Suara asli</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-3.5">
                {[
                  { icon: Heart, label: '42,5K' },
                  { icon: MessageCircle, label: '832' },
                  { icon: Bookmark, label: '3.120' },
                  { icon: Share2, label: 'Bagikan' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <Icon className="h-6 w-6" />
                    <span className="mt-0.5 text-[10px] font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Penghitung karakter */}
      <p
        className={`text-center text-xs tabular-nums ${
          over ? 'font-medium text-danger' : 'text-muted'
        }`}
      >
        Caption {count.toLocaleString('id-ID')}/{limit.toLocaleString('id-ID')}{' '}
        karakter
        {over && ' — melebihi batas platform ini'}
      </p>
    </div>
  );
}