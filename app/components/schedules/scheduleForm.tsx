'use client';

import { useEffect, useState, type DragEvent, type FormEvent } from 'react';

import Dialog from '@/app/components/ui/Dialog';
import LivePreview from './livePreview';
import TemplateModal from './templateModal';
import { PLATFORMS, type Platform, type Schedule, type Template } from './types';
import { PLATFORM_ICON, PLATFORM_LIMIT, dateKey } from './meta';

export type ComposerInitial = {
  title?: string;
  caption?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  imageUrl?: string | null;
};

type Props = {
  initial?: ComposerInitial;
  templates: Template[];
  onSaved: (s: Schedule) => void;
  onClose: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const TIME_PRESETS = ['07:00', '12:00', '16:00', '19:00'];

const isValidImage = (f: File) => {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  return (
    (ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.includes(ext)) &&
    f.size <= MAX_FILE_SIZE
  );
};

const fieldClass = (err: boolean) =>
  `w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:ring-2 ${
    err
      ? 'border-danger focus:ring-danger/20'
      : 'border-line focus:border-accent focus:ring-accent/20'
  }`;

const chip =
  'cursor-pointer rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function ScheduleForm({
  initial,
  templates,
  onSaved,
  onClose,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [caption, setCaption] = useState(initial?.caption ?? '');
  const [date, setDate] = useState(initial?.date ?? dateKey(new Date()));
  const [time, setTime] = useState(initial?.time ?? '09:00');
  const [previewPlatform, setPreviewPlatform] = useState<Platform>('Instagram');

  const [file, setFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [errors, setErrors] = useState<{ title?: string; when?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [tab, setTab] = useState<'form' | 'preview'>('form');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // URL sementara untuk pratinjau foto yang dipilih
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const photo = objectUrl ?? existingImage;

  const limit = PLATFORM_LIMIT[previewPlatform];
  const over = caption.length > limit;

  const when = date && time ? new Date(`${date}T${time}`) : null;
  const isPast = when !== null && when.getTime() < Date.now();

  const dirty =
    title !== (initial?.title ?? '') ||
    caption !== (initial?.caption ?? '') ||
    file !== null;

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const setQuickDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    setDate(dateKey(d));
    setErrors((p) => ({ ...p, when: undefined }));
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!isValidImage(f)) {
      setPhotoError('Gunakan JPG, PNG, atau WebP dengan ukuran maksimal 10 MB.');
      return;
    }
    setPhotoError('');
    setFile(f);
  };

  const removePhoto = () => {
    setFile(null);
    setExistingImage(null);
    setPhotoError('');
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const applyTemplate = (t: Template) => {
    setCaption(t.content);
    if (!title.trim()) setTitle(t.name);
    setPreviewPlatform(t.platform);
    setTemplatesOpen(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const next: { title?: string; when?: string } = {};
    if (!title.trim()) next.title = 'Judul konten wajib diisi.';
    if (!date || !time) next.when = 'Tanggal dan waktu wajib diisi.';
    setErrors(next);
    if (next.title || next.when) {
      setTab('form');
      return;
    }

    setSaving(true);
    setServerError(null);

    try {
      let imageUrl: string | null = existingImage;

      if (file) {
        const fd = new FormData();
        fd.append('file', file);

        const up = await fetch('/api/uploads/schedule', {
          method: 'POST',
          body: fd,
        });
        const upData = await up.json().catch(() => ({}));

        if (!up.ok || !upData.success) {
          setServerError(upData.error || 'Gagal mengupload foto. Coba lagi.');
          setSaving(false);
          return;
        }
        imageUrl = upData.url;
      }

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim(),
          status: 'scheduled',
          scheduled_for: new Date(`${date}T${time}`).toISOString(),
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setServerError(err.error ?? 'Gagal menyimpan jadwal. Coba lagi.');
        setSaving(false);
        return;
      }

      const saved: Schedule = await res.json();
      onSaved(saved);
    } catch {
      setServerError('Tidak dapat terhubung ke server. Coba lagi.');
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        onClose={requestClose}
        titleId="schedule-form-title"
        size="xl"
        dismissOnBackdrop={false}
      >
        <form onSubmit={submit} noValidate>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <h2
                id="schedule-form-title"
                className="text-lg font-semibold tracking-tight text-ink"
              >
                Jadwal baru
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Isi detail konten dan lihat hasilnya langsung di sebelah.
              </p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Tutup"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <i className="ti ti-x text-lg" aria-hidden="true" />
            </button>
          </div>

          {/* Tab mobile */}
          <div className="grid grid-cols-2 gap-1 border-b border-line p-2 lg:hidden">
            {(['form', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-ink text-bg' : 'text-ink-soft'
                }`}
              >
                {t === 'form' ? 'Isi jadwal' : 'Pratinjau'}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* ───── Kolom form ───── */}
            <div
              className={`flex flex-col gap-5 p-6 ${
                tab === 'form' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
                >
                  <i className="ti ti-alert-circle mt-0.5 text-base" aria-hidden="true" />
                  <p>{serverError}</p>
                </div>
              )}

              {/* Judul */}
              <div>
                <label htmlFor="sch-title" className="mb-1.5 block text-sm font-medium text-ink">
                  Judul konten
                </label>
                <input
                  id="sch-title"
                  autoFocus
                  value={title}
                  maxLength={255}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                  }}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'sch-title-err' : undefined}
                  placeholder="Contoh: Laporan Harian Disdukcapil"
                  className={fieldClass(Boolean(errors.title))}
                />
                {errors.title && (
                  <p id="sch-title-err" className="mt-1.5 text-xs text-danger">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Tanggal & waktu */}
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-ink">
                  Tanggal & waktu tayang
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (errors.when) setErrors((p) => ({ ...p, when: undefined }));
                    }}
                    aria-label="Tanggal"
                    aria-invalid={Boolean(errors.when)}
                    className={fieldClass(Boolean(errors.when))}
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      if (errors.when) setErrors((p) => ({ ...p, when: undefined }));
                    }}
                    aria-label="Waktu"
                    aria-invalid={Boolean(errors.when)}
                    className={fieldClass(Boolean(errors.when))}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <button type="button" onClick={() => setQuickDate(0)} className={chip}>
                    Hari ini
                  </button>
                  <button type="button" onClick={() => setQuickDate(1)} className={chip}>
                    Besok
                  </button>
                  <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
                  {TIME_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`${chip} tabular-nums ${
                        time === t ? '!border-accent !bg-accent-soft !text-accent' : ''
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {errors.when ? (
                  <p className="mt-1.5 text-xs text-danger">{errors.when}</p>
                ) : isPast ? (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
                    <i className="ti ti-alert-triangle text-sm" aria-hidden="true" />
                    Waktu ini sudah lewat. Jadwal akan langsung tampil sebagai terlewat.
                  </p>
                ) : null}
              </fieldset>

              {/* Caption */}
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="sch-caption" className="text-sm font-medium text-ink">
                    Caption
                  </label>
                  <button
                    type="button"
                    onClick={() => setTemplatesOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <i className="ti ti-file-text text-sm" aria-hidden="true" />
                    Pakai template
                  </button>
                </div>
                <textarea
                  id="sch-caption"
                  value={caption}
                  rows={7}
                  onChange={(e) => setCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Tulis caption di sini…"
                  className={`${fieldClass(false)} resize-y leading-relaxed`}
                />
                <p
                  className={`mt-1.5 text-xs tabular-nums ${
                    over ? 'text-danger' : 'text-muted'
                  }`}
                >
                  {caption.length.toLocaleString('id-ID')}/
                  {limit.toLocaleString('id-ID')} karakter (batas{' '}
                  {previewPlatform === 'Twitter' ? 'X' : previewPlatform})
                </p>
              </div>

              {/* Foto */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">
                  Foto konten <span className="font-normal text-muted">(opsional)</span>
                </p>

                {photoError && (
                  <p role="alert" className="mb-2 text-xs text-danger">
                    {photoError}
                  </p>
                )}

                {photo ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <img
                      src={photo}
                      alt="Foto konten"
                      className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {file?.name ?? 'Foto dari jadwal sebelumnya'}
                      </p>
                      <p className="text-xs text-muted">
                        {file
                          ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                          : 'Digunakan ulang'}
                      </p>
                    </div>
                    <label className="cursor-pointer rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:border-line-strong hover:text-ink focus-within:outline-2 focus-within:outline-accent">
                      Ganti
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          pickFile(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                      dragging
                        ? 'border-accent bg-accent-soft'
                        : 'border-line-strong hover:border-accent hover:bg-accent-soft/40'
                    }`}
                  >
                    <i className="ti ti-photo-up text-2xl text-accent" aria-hidden="true" />
                    <p className="text-sm text-ink-soft">
                      Tarik foto ke sini atau{' '}
                      <span className="font-medium text-accent">pilih file</span>
                    </p>
                    <p className="text-xs text-muted">JPG, PNG, WebP · maks. 10 MB</p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        pickFile(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Info platform */}
              <div className="flex items-start gap-3 rounded-xl bg-bg p-3.5">
                <i className="ti ti-info-circle mt-0.5 text-base text-accent" aria-hidden="true" />
                <div className="text-xs leading-relaxed text-muted">
                  <p>
                    Jadwal dibuat untuk <span className="font-medium text-ink">semua platform</span>.
                    Centang tiap platform di agenda setelah konten diunggah.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PLATFORMS.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                      >
                        <i className={`ti ${PLATFORM_ICON[p]} text-xs`} aria-hidden="true" />
                        {p === 'Twitter' ? 'X' : p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ───── Kolom pratinjau ───── */}
            <aside
              className={`border-t border-line bg-bg p-5 lg:border-l lg:border-t-0 ${
                tab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <p className="mb-3 text-sm font-medium text-ink">Pratinjau langsung</p>
              <LivePreview
                platform={previewPlatform}
                setPlatform={setPreviewPlatform}
                title={title}
                caption={caption}
                photo={photo}
              />
            </aside>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line px-6 py-4">
            {confirmDiscard ? (
              <div role="alert" className="flex w-full flex-wrap items-center gap-3">
                <p className="text-sm text-ink">Buang perubahan yang belum disimpan?</p>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDiscard(false)}
                    className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-line-strong hover:text-ink"
                  >
                    Lanjut mengisi
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-xl bg-danger px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    Buang
                  </button>
                </div>
              </div>
            ) : (
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {saving && (
                    <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
                  )}
                  {saving ? 'Menyimpan…' : 'Simpan jadwal'}
                </button>
              </div>
            )}
          </div>
        </form>
      </Dialog>

      {templatesOpen && (
        <TemplateModal
          templates={templates}
          onSelect={applyTemplate}
          onClose={() => setTemplatesOpen(false)}
        />
      )}
    </>
  );
}