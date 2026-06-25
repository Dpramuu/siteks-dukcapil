import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { TemplateInsert } from '@/app/components/template/types';

// POST /api/templates
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: TemplateInsert = await request.json();

  if (!body.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'name dan content wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('templates')
    .insert([{
      user_id:  user.id,
      name:     body.name.trim(),
      platform: body.platform,
      content:  body.content.trim(),
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}