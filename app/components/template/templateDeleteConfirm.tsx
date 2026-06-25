import type { Template } from './types';

type Props = {
  template: Template;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function TemplateDeleteConfirm({ template, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-red-950 flex items-center justify-center">
            <i className="ti ti-trash" style={{ fontSize: 20, color: '#F09595' }} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-white">Hapus template?</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Template <span className="text-white font-medium">{template.name}</span> akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-sm text-white font-medium transition-colors">
            Ya, hapus
          </button>
        </div>
      </div>
    </div>
  );
}