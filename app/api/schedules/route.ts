import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { ScheduleInsert } from '@/app/components/schedules/types';

const PLATFORMS = ['Instagram', 'TikTok', 'Twitter'] as const;

// POST /api/schedules
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: ScheduleInsert = await request.json();

  // 1. Insert schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .insert([{
      user_id:       user.id,
      template_id:   body.template_id ?? null,
      title:         body.title,
      caption:       body.caption,
      status:        body.status ?? 'scheduled',
      scheduled_for: body.scheduled_for,
    }])
    .select()
    .single();

  if (scheduleError) return NextResponse.json({ error: scheduleError.message }, { status: 500 });

  // 2. Otomatis insert 3 row schedule_platforms (Instagram, TikTok, Twitter)
  const platformRows = PLATFORMS.map(platform => ({
    schedule_id:  schedule.id,
    platform,
    is_uploaded:  false,
    uploaded_at:  null,
  }));

  const { error: platformError } = await supabase
    .from('schedule_platforms')
    .insert(platformRows);

  if (platformError) return NextResponse.json({ error: platformError.message }, { status: 500 });

  // 3. Return schedule + platforms
  const { data: full } = await supabase
    .from('schedules')
    .select('*, schedule_platforms(*)')
    .eq('id', schedule.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}