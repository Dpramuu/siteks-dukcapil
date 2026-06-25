import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import DashboardPage from '@/app/components/schedules/DashboardPage';

export default async function DashboardRoute() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: schedules, error: errSchedules },
  ] = await Promise.all([
    supabase
      .from('schedules')
      .select('id, title, platform, status, scheduled_for')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true }),
  ]);

  if (errSchedules) throw new Error(errSchedules.message);

  const allSchedules = schedules ?? [];

  // Hitung stats
  const totalKonten = allSchedules.length;
  const terjadwal   = allSchedules.filter(s => s.status === 'scheduled').length;
  const terbit      = allSchedules.filter(s => s.status === 'published').length;

  // Hitung konten per platform
  const platformCount: Record<string, number> = {};
  for (const s of allSchedules) {
    platformCount[s.platform] = (platformCount[s.platform] ?? 0) + 1;
  }

  // Hitung aktivitas per bulan tahun berjalan
  const currentYear = new Date().getFullYear();
  const monthlyCount = Array(12).fill(0);
  for (const s of allSchedules) {
    const d = new Date(s.scheduled_for);
    if (d.getFullYear() === currentYear) {
      monthlyCount[d.getMonth()]++;
    }
  }

  // 3 jadwal terdekat yang belum published
  const now = new Date().toISOString();
  const upcomingSchedules = allSchedules
    .filter(s => s.status !== 'published' && s.scheduled_for >= now)
    .slice(0, 3);

  return (
    <DashboardPage
      stats={{ totalKonten, terjadwal, terbit }}
      platformCount={platformCount}
      monthlyCount={monthlyCount}
      upcomingSchedules={upcomingSchedules}
    />
  );
}