"use client";

import { useEffect, useState } from "react";
import { type Platform } from "./types";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  platform: Platform;
  setPlatform: (v: Platform) => void;
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
  caption: string;
  setCaption: (v: string) => void;
  successMsg: boolean;
  onSave: () => void;
  onOpenTemplates: () => void;
  onPhotoPreviewChange?: (url: string | null) => void;
  onPhotoFileChange?: (file: File | null) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const isValidMediaFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const hasAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.includes(
    `.${extension}`,
  );

  return (hasAllowedType || hasAllowedExtension) && file.size <= MAX_FILE_SIZE;
};

export default function ScheduleForm({
  title,
  setTitle,
  platform,
  setPlatform,
  scheduledFor,
  setScheduledFor,
  caption,
  setCaption,
  successMsg,
  onSave,
  onOpenTemplates,
  onPhotoPreviewChange,
  onPhotoFileChange,
}: Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string>("");

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (successMsg) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError("");
      onPhotoPreviewChange?.(null);
      onPhotoFileChange?.(null);
    }
  }, [successMsg, onPhotoPreviewChange, onPhotoFileChange]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isValidMediaFile(file)) {
      setPhotoFile(null);
      setPhotoPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      onPhotoPreviewChange?.(null);
      onPhotoFileChange?.(null);
      setPhotoError(
        "Format file tidak valid. Gunakan JPG, JPEG, PNG, atau WebP dengan ukuran maksimal 10 MB.",
      );
      event.target.value = "";
      return;
    }

    setPhotoError("");

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(objectUrl);
    onPhotoPreviewChange?.(objectUrl);
    onPhotoFileChange?.(file);
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    onPhotoPreviewChange?.(null);
    onPhotoFileChange?.(null);
    setPhotoError("");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-4">Tambah jadwal baru</p>

      {successMsg && (
        <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          Jadwal berhasil disimpan!
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Judul */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">
            Judul konten
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600"
            placeholder="Nama konten..."
          />
        </div>

        {/* Tanggal & waktu */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">
            Tanggal & waktu
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
          >
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter">Twitter</option>
          </select>
        </div>

        {/* Caption + Tombol Template */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-400">Caption</label>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              Pilih Template
            </button>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
            placeholder="Tulis caption di sini..."
          />
        </div>

        {/* Area Visual Konten */}
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">
            Area Visual Konten
          </label>

          {photoError && (
            <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {photoError}
            </div>
          )}

          {photoPreview ? (
            <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 p-3">
              <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                <img
                  src={photoPreview}
                  alt="Preview foto konten"
                  className="h-48 w-full object-cover"
                />
              </div>

              <div className="mt-3 flex gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-white transition hover:border-zinc-600 hover:bg-zinc-700">
                  Ganti Foto
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/60 px-4 py-6 text-center transition hover:border-zinc-600 hover:bg-zinc-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700/70 text-sm font-semibold text-white">
                +
              </div>
              <div>
                <p className="text-sm font-medium text-white">Upload Foto</p>
                <p className="text-[11px] text-zinc-500">
                  JPG, JPEG, PNG, WebP • Maks. 10 MB
                </p>
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={onSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Simpan Jadwal
        </button>
      </div>
    </div>
  );
}
