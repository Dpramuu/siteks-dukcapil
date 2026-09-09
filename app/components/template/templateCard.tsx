import type { Template } from './types';

const PLATFORM_STYLE = {
  Instagram: { bg: '#E6F1FB', tc: '#0C447C' },
  TikTok:    { bg: '#FBEAF0', tc: '#72243E' },
  Twitter:   { bg: '#E1F5EE', tc: '#085041' },
};

type Props = {
  template: Template;
  onEdit: (t: Template) => void;
  onDelete: (t: Template) => void;
};

export default function TemplateCard({ template, onEdit, onDelete }: Props) {
  const style = PLATFORM_STYLE[template.platform];
  const preview = template.content.length > 100
    ? template.content.slice(0, 100) + '...'
    : template.content;

  return (
    <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug">{template.name}</p>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => onEdit(template)} aria-label="Edit template"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(template)} aria-label="Hapus template"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-red-950 hover:text-red-400 hover:border-red-900 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <span className="text-xs px-2.5 py-0.5 rounded-full self-start font-medium"
        style={{ background: style.bg, color: style.tc }}>
        {template.platform}
      </span>

      <hr className="border-zinc-800" />

      <p className="text-xs text-zinc-400 leading-relaxed">{preview}</p>
    </div>
  );
}