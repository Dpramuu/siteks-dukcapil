import type { Platform } from './types';

export const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'Twitter'];

export const PLATFORM_META: Record<Platform, { icon: string; limit: number }> = {
  Instagram: { icon: 'ti-brand-instagram', limit: 2200 },
  TikTok: { icon: 'ti-brand-tiktok', limit: 2200 },
  Twitter: { icon: 'ti-brand-x', limit: 280 },
};

export const formatDate = (value: string | Date) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};