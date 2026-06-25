import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { TemplateUpdate } from '@/app/components/template/types';

// PATCH /api/templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } //  Diubah menjadi Promise
) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 📄 Ambil id dari params dengan menggunakan await
  const { id } = await params;

  const body: TemplateUpdate = await request.json();

  const { data, error } = await supabase
    .from('templates')
    .update({
      ...(body.name     !== undefined && { name:     body.name.trim() }),
      ...(body.platform !== undefined && { platform: body.platform }),
      ...(body.content  !== undefined && { content:  body.content.trim() }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)             // 🔄 Menggunakan id yang sudah di-await
    .eq('user_id', user.id)   // hanya bisa update milik sendiri
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });

  return NextResponse.json(data);
}

// DELETE /api/templates/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } //  Diubah menjadi Promise
) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 📄 Ambil id dari params dengan menggunakan await
  const { id } = await params;

  const { error, count } = await supabase
    .from('templates')
    .delete({ count: 'exact' })
    .eq('id', id)             // 🔄 Menggunakan id yang sudah di-await
    .eq('user_id', user.id);   // hanya bisa hapus milik sendiri

  if (error)      return NextResponse.json({ error: error.message }, { status: 500 });
  if (count === 0) return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}