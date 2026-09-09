'use client';

import { useState } from 'react';
import Calendar      from '../../components/schedules/calendar';
import LivePreview   from '../../components/schedules/livePreview';
import ScheduleForm  from '../../components/schedules/scheduleForm';
import TemplateModal from '../../components/schedules/templateModal';
import {
  type FilterType,
  type Platform,
  type Schedule,
  type ScheduleInsert,
  type Template,
} from '../../components/schedules/types';

type Props = {
  initialSchedules: Schedule[];
  initialTemplates: Template[];
  userId: string;
};

export default function SchedulePage({ initialSchedules, initialTemplates, userId }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules ?? []);
  const templates = initialTemplates ?? [];

  // Calendar state
  const today = new Date();
  const [cur, setCur]           = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter]     = useState<FilterType>('all');
  const [selected, setSelected] = useState<{ date: string; items: Schedule[] } | null>(null);

  // Form state
  const [title, setTitle]               = useState('');
  const [platform, setPlatform]         = useState<Platform>('Instagram');
  const [scheduledFor, setScheduledFor] = useState('');
  const [caption, setCaption]           = useState('');
  const [successMsg, setSuccessMsg]     = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInjectTemplate = (t: Template) => {
  setTitle(t.name);      // ← isi judul dengan nama template
  setCaption(t.content);
  setIsModalOpen(false);
};

  const handleSave = async () => {
    if (!title || !scheduledFor) {
      alert('Judul dan tanggal wajib diisi!');
      return;
    }

    const body: ScheduleInsert = {
      title,
      caption,
      status:        'scheduled',
      scheduled_for: new Date(scheduledFor).toISOString(),
    };

    const res = await fetch('/api/schedules', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      alert('Gagal menyimpan jadwal. Coba lagi.');
      return;
    }

    const saved: Schedule = await res.json();
    setSchedules(prev => [...prev, saved]);

    // Reset form
    setTitle('');
    setScheduledFor('');
    setCaption('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="flex flex-col gap-4">

      <Calendar
        cur={cur}
        setCur={setCur}
        filter={filter}
        setFilter={setFilter}
        schedules={schedules}
        setSchedules={setSchedules}
        selected={selected}
        setSelected={setSelected}
      />

      <div className="grid grid-cols-2 gap-4">
        <ScheduleForm
          title={title}               setTitle={setTitle}
          platform={platform}         setPlatform={setPlatform}
          scheduledFor={scheduledFor} setScheduledFor={setScheduledFor}
          caption={caption}           setCaption={setCaption}
          successMsg={successMsg}
          onSave={handleSave}
          onOpenTemplates={() => setIsModalOpen(true)}
        />

        <LivePreview platform={platform} caption={caption} />
      </div>

      {isModalOpen && (
        <TemplateModal
          templates={templates}
          onSelect={handleInjectTemplate}
          onClose={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
}