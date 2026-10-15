'use client';

import { useState, type FormEvent } from 'react';

import TemplateDialog from './templateDialog';
import { PLATFORMS, PLATFORM_META } from './meta';
import type { Platform, Template } from './types';

type FormData = { name: string; platform: Platform; content: string };

type Props = {
  initial?: Template | null;
  /** Kembalikan pesan error (string) jika gagal, atau null jika berhasil. */
  onSave: (data: FormData) => Promise<string | null>;
  onClose: () => void;
};

const NAME_MAX = 255;

const fieldClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:ring-2 ${
    hasError
      ? 'border-danger focus:ring-danger/20'
      : 'border-line focus:border-accent focus:ring-accent/20'
  }`;

export default function TemplateFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [platform, setPlatform] = useState<Platform>(
    initial?.platform ?? 'Instagram',
  );
  const [content, setContent] = useState(initial?.content ?? '');

  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial);
  const limit = PLATFORM_META[platform].limit;
  const count = content.length;
  const over = count > limit;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const next: { name?: string; content?: string } = {};
    if (!name.trim()) next.name = 'Nama template wajib diisi.';
    if (!content.trim()) next.content = 'Isi caption wajib diisi.';

    setErrors(next);
    if (next.name || next.content) return;

    setSaving(true);
    setServerError(null);

    const err = await onSave({
      name: name.trim(),
      platform,
      content: content.trim(),
    });

    // Jika sukses, parent menutup modal ini
    if (err) {
      setServerError(err);
      setSaving(false);
    }
  };

  return (
    <TemplateDialog onClose={onClose} titleId="template-form-title">
      <form onSubmit={submit} noValidate>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2
              id="template-form-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              {isEdit ? 'Edit template' : 'Buat template baru'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {isEdit
                ? 'Perbarui nama, platform, atau isi caption.'
                : 'Simpan caption yang sering dipakai agar tidak mengetik ulang.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
            >
              <i className="ti ti-alert-circle mt-0.5 text-base" aria-hidden="true" />
              <p>{serverError}</p>
            </div>
          )}

          {/* Nama */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="tpl-name" className="text-sm font-medium text-ink">
                Nama template
              </label>
              <span className="text-[11px] tabular-nums text-muted">
                {name.length}/{NAME_MAX}
              </span>
            </div>
            <input
              id="tpl-name"
              autoFocus
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'tpl-name-error' : undefined}
              placeholder="Contoh: Laporan Harian Disdukcapil"
              className={fieldClass(Boolean(errors.name))}
            />
            {errors.name && (
              <p id="tpl-name-error" className="mt-1.5 text-xs text-danger">
                {errors.name}
              </p>
            )}
          </div>

          {/* Platform */}
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink">
              Platform
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <label key={p} className="cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value={p}
                    checked={platform === p}
                    onChange={() => setPlatform(p)}
                    className="peer sr-only"
                  />
                  <span className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-2 py-3 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    <i
                      className={`ti ${PLATFORM_META[p].icon} text-xl`}
                      aria-hidden="true"
                    />
                    {p}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Caption */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="tpl-content" className="text-sm font-medium text-ink">
                Isi caption
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  over ? 'font-medium text-danger' : 'text-muted'
                }`}
              >
                {count.toLocaleString('id-ID')}/{limit.toLocaleString('id-ID')}
              </span>
            </div>
            <textarea
              id="tpl-content"
              value={content}
              rows={8}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content)
                  setErrors((p) => ({ ...p, content: undefined }));
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              aria-invalid={Boolean(errors.content)}
              aria-describedby="tpl-content-hint"
              placeholder="Tulis caption template…"
              className={`${fieldClass(Boolean(errors.content))} resize-y leading-relaxed`}
            />
            <div id="tpl-content-hint" className="mt-1.5 text-xs">
              {errors.content ? (
                <p className="text-danger">{errors.content}</p>
              ) : over ? (
                <p className="text-danger">
                  Melebihi batas {limit.toLocaleString('id-ID')} karakter{' '}
                  {platform}. Template tetap bisa disimpan.
                </p>
              ) : (
                <p className="text-muted">
                  Tips: tekan Ctrl + Enter untuk menyimpan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-28 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {saving && (
              <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
            )}
            {saving ? 'Menyimpan…' : isEdit ? 'Perbarui' : 'Simpan'}
          </button>
        </div>
      </form>
    </TemplateDialog>
  );
}