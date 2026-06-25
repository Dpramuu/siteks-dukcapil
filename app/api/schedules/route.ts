import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { ScheduleInsert } from '@/app/components/schedules/types';

// POST /api/schedules
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: ScheduleInsert = await request.json();

  const { data, error } = await supabase
    .from('schedules')
    .insert([{
      user_id:       user.id,              // paksa dari session — jangan percaya body
      template_id:   body.template_id ?? null,
      title:         body.title,
      caption:       body.caption,
      platform:      body.platform,
      status:        body.status ?? 'draft',
      scheduled_for: body.scheduled_for,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}