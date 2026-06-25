'use client';

import { useState, useEffect } from 'react';
import TemplateCard from '../../components/template/templateCard';
import TemplateFormModal from '../../components/template/templateFormModal';
import TemplateDeleteConfirm from '../../components/template/templateDeleteConfirm';
import type { Template, Platform } from '../../components/template/types';

type FilterType = 'all' | Platform;

// ── Dummy data — ganti dengan fetch Supabase ──
const DUMMY: Template[] = [
  { id: '1', user_id: 'u1', name: 'Caption Instagram', platform: 'Instagram', content: 'Ini caption untuk Instagram #hashtag', created_at: '', updated_at: '' },
  { id: '2', user_id: 'u1', name: 'Caption TikTok', platform: 'TikTok', content: 'Ini caption untuk TikTok @mention', created_at: '', updated_at: '' },
  { id: '3', user_id: 'u1', name: 'Caption Twitter', platform: 'Twitter', content: 'Ini caption untuk Twitter dengan link https://example.com', created_at: '', updated_at: '' },
];

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'TikTok', value: 'TikTok' },
  { label: 'Twitter', value: 'Twitter' },
];

export default function TemplatePage() {
  const [templates, setTemplates]   = useState<Template[]>([]);
  const [filter, setFilter]         = useState<FilterType>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  // Fetch templates — ganti dengan Supabase
  useEffect(() => {
    // TODO: const { data } = await supabase.from('templates').select('*');
    setTemplates(DUMMY);
  }, []);

  const filtered = filter === 'all' ? templates : templates.filter(t => t.platform === filter);

  const handleSave = (data: { name: string; platform: Platform; content: string; }) => {
    if (editTarget) {
      // TODO: await supabase.from('templates').update(data).eq('id', editTarget.id);
      setTemplates(prev => prev.map(t => t.id === editTarget.id ? { ...t, ...data } : t));
    } else {
      const newId = String(Date.now());
      const newTemplate: Template = {
        id: newId,
        user_id: 'u1',
        created_at: '',
        updated_at: '',
        ...data,
      };
      // TODO: await supabase.from('templates').insert([{ ...data }]);
      setTemplates(prev => [...prev, newTemplate]);
    }
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    // TODO: await supabase.from('templates').delete().eq('id', deleteTarget.id);
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
        <button onClick={() => { setEditTarget(null); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium transition-colors">
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
          <button onClick={() => { setEditTarget(null); setIsFormOpen(true); }}
            className="mt-4 px-4 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
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