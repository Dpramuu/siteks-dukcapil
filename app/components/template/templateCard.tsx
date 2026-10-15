'use client';

import { useEffect, useRef, useState } from 'react';

import { PLATFORM_META, formatDate } from './meta';
import type { Template } from './types';

type Props = {
  template: Template;
  onEdit: (t: Template) => void;
  onDelete: (t: Template) => void;
};

const iconBtn =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function TemplateCard({ template, onEdit, onDelete }: Props) {
  const meta = PLATFORM_META[template.platform];

  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const chars = template.content.length;
  const overLimit = chars > meta.limit;
  const isLong =
    template.content.length > 180 || template.content.split('\n').length > 4;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:border-line-strong hover:shadow-sm">
      {/* Header */}
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <i className={`ti ${meta.icon} text-xl`} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm font-semibold text-ink"
            title={template.name}
          >
            {template.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted">{template.platform}</p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(template)}
            aria-label={`Edit template ${template.name}`}
            title="Edit"
            className={`${iconBtn} hover:bg-bg hover:text-ink`}
          >
            <i className="ti ti-pencil text-base" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(template)}
            aria-label={`Hapus template ${template.name}`}
            title="Hapus"
            className={`${iconBtn} hover:bg-danger/10 hover:text-danger`}
          >
            <i className="ti ti-trash text-base" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Isi caption */}
      <div className="mt-4 flex-1 rounded-xl bg-bg p-3.5">
        <p
          className={`whitespace-pre-line break-words text-[13px] leading-relaxed text-ink-soft ${
            expanded ? '' : 'line-clamp-4'
          }`}
        >
          {template.content}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 cursor-pointer text-xs font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {expanded ? 'Ringkas' : 'Lihat selengkapnya'}
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[11px] text-muted">
          <span
            className={`inline-flex items-center gap-1 tabular-nums ${
              overLimit ? 'font-medium text-danger' : ''
            }`}
            title={
              overLimit
                ? `Melebihi batas ${meta.limit} karakter untuk ${template.platform}`
                : undefined
            }
          >
            {overLimit && (
              <i className="ti ti-alert-triangle text-xs" aria-hidden="true" />
            )}
            {chars.toLocaleString('id-ID')} karakter
          </span>
          <span aria-hidden="true"> · </span>
          <span suppressHydrationWarning>
            {formatDate(template.updated_at)}
          </span>
        </p>

        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            copied
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
          }`}
        >
          <i
            className={`ti ${copied ? 'ti-check' : 'ti-copy'} text-sm`}
            aria-hidden="true"
          />
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </footer>
    </article>
  );
}