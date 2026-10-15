'use client';

import { useState } from 'react';

import TemplateDialog from './templateDialog';
import { PLATFORM_META } from './meta';
import type { Template } from './types';

type Props = {
  template: Template;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function TemplateDeleteConfirm({
  template,
  onConfirm,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (loading) return;
    setLoading(true);
    await onConfirm(); // parent menutup dialog setelah selesai
  };

  return (
    <TemplateDialog onClose={onCancel} titleId="template-delete-title" size="sm">
      <div className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <i className="ti ti-trash text-2xl" aria-hidden="true" />
          </span>

          <div>
            <h2
              id="template-delete-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Hapus template ini?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Template akan dihapus permanen dan tidak bisa dikembalikan.
              Jadwal yang sudah memakai template ini tidak ikut terhapus.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-xl border border-line bg-bg px-3.5 py-3 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <i
                className={`ti ${PLATFORM_META[template.platform].icon} text-lg`}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {template.name}
              </p>
              <p className="text-xs text-muted">{template.platform}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={loading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            {loading && (
              <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
            )}
            {loading ? 'Menghapus…' : 'Ya, hapus'}
          </button>
        </div>
      </div>
    </TemplateDialog>
  );
}