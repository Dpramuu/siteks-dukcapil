import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import TemplatePage from '@/app/components/template/TemplatePage';
import type { Template } from '@/app/components/template/types';

export default async function TemplateRoute() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return <TemplatePage userId={user.id} initialTemplates={(data ?? []) as Template[]} />;
}