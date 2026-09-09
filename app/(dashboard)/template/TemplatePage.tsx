'use client';

import { useState } from 'react';
import TemplateCard from '../../components/template/templateCard';
import TemplateFormModal from '../../components/template/templateFormModal';
import TemplateDeleteConfirm from '../../components/template/templateDeleteConfirm';
import type { Template, Platform } from '../../components/template/types';

type FilterType = 'all' | Platform;

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua',     value: 'all' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'TikTok',   value: 'TikTok' },
  { label: 'Twitter',  value: 'Twitter' },
];

type Props = { initialTemplates: Template[] };

export default function TemplatePage({ initialTemplates }: Props) {
  const [templates, setTemplates]       = useState<Template[]>(initialTemplates);
  const [filter, setFilter]             = useState<FilterType>('all');
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const filtered = filter === 'all'
    ? templates
    : templates.filter(t => t.platform === filter);

  const handleSave = async (data: { name: string; platform: Platform; content: string }) => {
    if (editTarget) {
      // PATCH
      const res = await fetch(`/api/templates/${editTarget.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) { alert('Gagal mengupdate template.'); return; }
      const updated: Template = await res.json();
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      // POST
      const res = await fetch('/api/templates', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) { alert('Gagal menyimpan template.'); return; }
      const created: Template = await res.json();
      setTemplates(prev => [...prev, created]);
    }
    setEditTarget(null);
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/templates/${deleteTarget.id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Gagal menghapus template.'); return; }
    setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Template</h1>
          <p className="text-xs text-zinc-500 mt-1">Kelola template caption konten kamu</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium transition-colors"
        >
          <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
          Buat Template
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filter === f.value
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <i className="ti ti-file-off" style={{ fontSize: 32, color: '#52525b' }} aria-hidden="true" />
          <p className="text-sm text-zinc-500 mt-3">Belum ada template untuk platform ini.</p>
          <button
            onClick={() => { setEditTarget(null); setIsFormOpen(true); }}
            className="mt-4 px-4 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Buat template baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <TemplateCard key={t.id} template={t}
              onEdit={(t) => { setEditTarget(t); setIsFormOpen(true); }}
              onDelete={(t) => setDeleteTarget(t)} />
          ))}
        </div>
      )}

      {/* Modal form */}
      {isFormOpen && (
        <TemplateFormModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setIsFormOpen(false); setEditTarget(null); }} />
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <TemplateDeleteConfirm
          template={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} />
      )}

    </div>
  );
}