import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import SchedulePage from './SchedulePage';
import type { Schedule, Template } from '@/app/components/schedules/types';

export default async function ScheduleRoute() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: schedulesData, error: errSchedules },
    { data: templatesData, error: errTemplates },
  ] = await Promise.all([
    supabase
      .from('schedules')
      .select('*, schedule_platforms(*)')   // ← join schedule_platforms
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true }),
    supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true }),
  ]);

  if (errSchedules) throw new Error(errSchedules.message);
  if (errTemplates)  throw new Error(errTemplates.message);

  return (
    <SchedulePage
      initialSchedules={(schedulesData ?? []) as Schedule[]}
      initialTemplates={(templatesData ?? []) as Template[]}
      userId={user.id}
    />
  );
}