import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← await params dulu di Next.js 16

  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { is_uploaded }: { is_uploaded: boolean } = await request.json();

  // 1. Update is_uploaded di schedule_platforms
  const { data: updatedPlatform, error: updateError } = await supabase
    .from('schedule_platforms')
    .update({
      is_uploaded,
      uploaded_at: is_uploaded ? new Date().toISOString() : null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, schedules!inner(user_id)')
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  if (!updatedPlatform) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  // Pastikan hanya bisa update milik sendiri
  if (updatedPlatform.schedules.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scheduleId = updatedPlatform.schedule_id;

  // 2. Ambil semua platform untuk schedule ini
  const { data: allPlatforms, error: platformsError } = await supabase
    .from('schedule_platforms')
    .select('is_uploaded')
    .eq('schedule_id', scheduleId);

  if (platformsError) return NextResponse.json({ error: platformsError.message }, { status: 500 });

  // 3. Cek apakah semua platform sudah uploaded
  const allUploaded = allPlatforms?.every(p => p.is_uploaded) ?? false;
  const newStatus   = allUploaded ? 'published' : 'scheduled';

  // 4. Update status schedule
  await supabase
    .from('schedules')
    .update({
      status:     newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scheduleId)
    .eq('user_id', user.id);

  // 5. Return updated platform
  const { data: result } = await supabase
    .from('schedule_platforms')
    .select('*')
    .eq('id', id)
    .single();

  return NextResponse.json({ platform: result, status: newStatus });
}