export type Platform = 'Instagram' | 'TikTok' | 'Twitter';

export type Template = {
  id: string;
  name: string;
  platform: Platform;
  content: string;
};