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
  userId?: string;
};

export default function SchedulePage({ initialSchedules, initialTemplates }: Props) {
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

  // Preview state dari klik tanggal/jadwal kalender
  const [calendarPreviewSchedule, setCalendarPreviewSchedule] = useState<Schedule | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Saat user mengetik di form, otomatis beralih preview ke form
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (calendarPreviewSchedule) setCalendarPreviewSchedule(null);
  };

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    if (calendarPreviewSchedule) setCalendarPreviewSchedule(null);
  };

  const handlePlatformChange = (val: Platform) => {
    setPlatform(val);
  };

  const handleLoadIntoForm = (s: Schedule) => {
    setTitle(s.title);
    setCaption(s.caption);
    if (s.scheduled_for) {
      const d = new Date(s.scheduled_for);
      const pad = (n: number) => String(n).padStart(2, '0');
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setScheduledFor(localIso);
    }
    if (s.schedule_platforms?.[0]?.platform) {
      setPlatform(s.schedule_platforms[0].platform);
    }
    setCalendarPreviewSchedule(null);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInjectTemplate = (t: Template) => {
    setTitle(t.name);
    setCaption(t.content);
    if (t.platform) setPlatform(t.platform);
    setCalendarPreviewSchedule(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!title || !scheduledFor) {
      alert('Judul dan tanggal wajib diisi!');
      return;
    }

    let imageUrl = null;

    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);

      try {
        const uploadRes = await fetch("/api/uploads/schedule", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          alert('Gagal mengupload foto. Coba lagi.');
          return;
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          alert(uploadData.error || 'Gagal mengupload foto.');
          return;
        }

        imageUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat mengupload foto.');
        return;
      }
    }

    const body: ScheduleInsert & { image_url?: string | null } = {
      title,
      caption,
      status:        'scheduled',
      scheduled_for: new Date(scheduledFor).toISOString(),
      image_url:     imageUrl,
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
    setPhotoFile(null);
    setCalendarPreviewSchedule(null);
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
        setSelected={(v) => {
          setSelected(v);
          if (!v) setCalendarPreviewSchedule(null);
        }}
        previewScheduleId={calendarPreviewSchedule?.id}
        onSelectPreviewSchedule={(s) => setCalendarPreviewSchedule(s)}
        onLoadIntoForm={handleLoadIntoForm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <ScheduleForm
          title={title}               setTitle={handleTitleChange}
          platform={platform}         setPlatform={handlePlatformChange}
          scheduledFor={scheduledFor} setScheduledFor={setScheduledFor}
          caption={caption}           setCaption={handleCaptionChange}
          successMsg={successMsg}
          onSave={handleSave}
          onOpenTemplates={() => setIsModalOpen(true)}
          onPhotoPreviewChange={setPhotoPreview}
          onPhotoFileChange={setPhotoFile}
        />

        <LivePreview
          platform={platform}
          setPlatform={handlePlatformChange}
          title={calendarPreviewSchedule ? calendarPreviewSchedule.title : title}
          caption={calendarPreviewSchedule ? calendarPreviewSchedule.caption : caption}
          previewSource={calendarPreviewSchedule ? 'calendar' : 'form'}
          scheduleTitle={calendarPreviewSchedule?.title}
          onResetToForm={() => setCalendarPreviewSchedule(null)}
          photoPreview={photoPreview}
        />
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