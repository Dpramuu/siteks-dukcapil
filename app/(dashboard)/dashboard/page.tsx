import { redirect } from "next/navigation";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import DashboardPage from "@/app/components/schedules/DashboardPage";

import type {
  Platform,
  ScheduleStatus,
} from "@/app/components/schedules/types";

interface DashboardSchedule {
  id: string;
  title: string;
  status: ScheduleStatus;
  scheduled_for: string | null;
  schedule_platforms: {
    platform: Platform;
    is_uploaded: boolean;
  }[];
}

interface ScheduleRow {
  id: string;
  title: string;
  status: ScheduleStatus;
  scheduled_for: string | null;
}

interface SchedulePlatformRow {
  schedule_id: string;
  platform: Platform;
  is_uploaded: boolean;
}

export default async function DashboardRoute() {
  // Ambil user dari session lokal
  const userId = await getSessionUserId();

  // Belum login → ke halaman login
  if (!userId) {
    redirect("/login");
  }

  // =========================================================
  // 1. Ambil data schedules dari MySQL
  // =========================================================

  const [scheduleRows] = await pool.execute(
    `
    SELECT
      id,
      title,
      status,
      scheduled_for
    FROM schedules
    WHERE user_id = ?
    ORDER BY
      scheduled_for IS NULL ASC,
      scheduled_for ASC
    `,
    [userId],
  );

  const schedules = scheduleRows as ScheduleRow[];

  // =========================================================
  // 2. Ambil platform untuk schedule milik user tersebut
  // =========================================================

  const [platformRows] = await pool.execute(
    `
    SELECT
      sp.schedule_id,
      sp.platform,
      sp.is_uploaded
    FROM schedule_platforms sp
    INNER JOIN schedules s
      ON s.id = sp.schedule_id
    WHERE s.user_id = ?
    ORDER BY sp.created_at ASC
    `,
    [userId],
  );

  const schedulePlatforms = platformRows as SchedulePlatformRow[];

  // =========================================================
  // 3. Gabungkan schedule + platform
  // =========================================================

  const allSchedules: DashboardSchedule[] = schedules.map((schedule) => {
    const platforms = schedulePlatforms
      .filter((platform) => platform.schedule_id === schedule.id)
      .map((platform) => ({
        platform: platform.platform,
        is_uploaded: Boolean(platform.is_uploaded),
      }));

    return {
      id: schedule.id,
      title: schedule.title,
      status: schedule.status,
      scheduled_for: schedule.scheduled_for,
      schedule_platforms: platforms,
    };
  });

  // =========================================================
  // 4. Hitung statistik
  // =========================================================

  const totalKonten = allSchedules.length;

  const terjadwal = allSchedules.filter((s) => s.status === "scheduled").length;

  const terbit = allSchedules.filter((s) => s.status === "published").length;

  // =========================================================
  // 5. Hitung konten per platform
  // =========================================================

  const platformCount: Record<string, number> = {};

  for (const schedule of allSchedules) {
    const platforms = schedule.schedule_platforms ?? [];

    // Hindari duplikat platform
    const unique = new Set(platforms.map((p) => p.platform));

    for (const platform of unique) {
      platformCount[platform] = (platformCount[platform] ?? 0) + 1;
    }
  }

  // =========================================================
  // 6. Hitung aktivitas per bulan tahun berjalan
  // =========================================================

  const currentYear = new Date().getFullYear();

  const monthlyCount: number[] = Array(12).fill(0);

  for (const schedule of allSchedules) {
    if (!schedule.scheduled_for) {
      continue;
    }

    const date = new Date(schedule.scheduled_for);

    if (date.getFullYear() === currentYear) {
      monthlyCount[date.getMonth()]++;
    }
  }

// =========================================================
// 7. Ambil 3 jadwal terdekat yang belum published
// =========================================================

const now = new Date();

const upcomingSchedules = allSchedules
  .filter((schedule) => {
    if (
      schedule.status === "published" ||
      !schedule.scheduled_for
    ) {
      return false;
    }

    const scheduledDate = new Date(
      schedule.scheduled_for
    );

    return scheduledDate >= now;
  })
  .slice(0, 3)
  .map((schedule) => ({
    ...schedule,
    scheduled_for: schedule.scheduled_for!,
  }));

// =========================================================
// 8. Tampilkan Dashboard
// =========================================================

return (
  <DashboardPage
    stats={{
      totalKonten,
      terjadwal,
      terbit,
    }}
    platformCount={platformCount}
    monthlyCount={monthlyCount}
    upcomingSchedules={upcomingSchedules}
  />
)};
