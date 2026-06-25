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
            <i className="ti ti-edit" style={{ fontSize: 13 }} aria-hidden="true" />
          </button>
          <button onClick={() => onDelete(template)} aria-label="Hapus template"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-red-950 hover:text-red-400 hover:border-red-900 transition-colors">
            <i className="ti ti-trash" style={{ fontSize: 13 }} aria-hidden="true" />
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