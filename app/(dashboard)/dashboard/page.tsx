import { redirect } from "next/navigation";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import DashboardPage, {
  type MonthBucket,
} from "@/app/components/schedules/DashboardPage";

import type { Platform } from "@/app/components/schedules/types";

interface ScheduleRow {
  id: string;
  title: string;
  status: string;
  scheduled_for: Date | string | null;
}

interface PlatformRow {
  schedule_id: string;
  platform: Platform;
  is_uploaded: number | boolean;
}

type ScheduleState = "done" | "overdue" | "pending" | "draft";

const PLATFORMS: Platform[] = ["Instagram", "TikTok", "Twitter"];

const emptyYear = (): MonthBucket[] =>
  Array.from({ length: 12 }, () => ({ done: 0, pending: 0, overdue: 0 }));

const toDate = (value: Date | string | null): Date | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export default async function DashboardRoute() {
  // Ambil user dari session lokal
  const userId = await getSessionUserId();

  // Belum login → ke halaman login
  if (!userId) {
    redirect("/login");
  }

  // =========================================================
  // 1. Ambil schedules + platform milik user
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

  const schedules = scheduleRows as ScheduleRow[];
  const platformList = platformRows as PlatformRow[];

  // =========================================================
  // 2. Kelompokkan platform per schedule + hitung per platform
  // =========================================================

  const platformsBySchedule = new Map<
    string,
    { platform: Platform; is_uploaded: boolean }[]
  >();

  const platformStats = Object.fromEntries(
    PLATFORMS.map((p) => [p, { total: 0, uploaded: 0 }]),
  ) as Record<Platform, { total: number; uploaded: number }>;

  for (const row of platformList) {
    const uploaded = Boolean(row.is_uploaded);

    const list = platformsBySchedule.get(row.schedule_id) ?? [];
    list.push({ platform: row.platform, is_uploaded: uploaded });
    platformsBySchedule.set(row.schedule_id, list);

    if (platformStats[row.platform]) {
      platformStats[row.platform].total++;
      if (uploaded) platformStats[row.platform].uploaded++;
    }
  }

  // =========================================================
  // 3. Klasifikasi tiap schedule (sumber kebenaran: checklist + waktu)
  // =========================================================

  const now = new Date();
  const currentYear = now.getFullYear();

  const stats = {
    totalKonten: schedules.length,
    terjadwal: 0,
    terlewat: 0,
    terbit: 0,
    draft: 0,
  };

  const monthlyByYear: Record<string, MonthBucket[]> = {};
  const yearSet = new Set<number>([currentYear]);

  const upcoming: {
    id: string;
    title: string;
    scheduled_for: string;
    schedule_platforms: { platform: Platform; is_uploaded: boolean }[];
    ts: number;
  }[] = [];

  for (const schedule of schedules) {
    const platforms = platformsBySchedule.get(schedule.id) ?? [];
    const when = toDate(schedule.scheduled_for);

    const allUploaded =
      platforms.length > 0 && platforms.every((p) => p.is_uploaded);

    let state: ScheduleState;

    if (allUploaded) {
      state = "done";
    } else if (!when) {
      state = "draft"; // belum punya tanggal
    } else {
      state = when.getTime() < now.getTime() ? "overdue" : "pending";
    }

    // Statistik ringkas
    if (state === "done") stats.terbit++;
    else if (state === "overdue") stats.terlewat++;
    else if (state === "pending") stats.terjadwal++;
    else stats.draft++;

    // Aktivitas per bulan (semua tahun)
    if (when && state !== "draft") {
      const year = when.getFullYear();
      yearSet.add(year);

      const key = String(year);
      monthlyByYear[key] ??= emptyYear();
      monthlyByYear[key][when.getMonth()][state]++;
    }

    // Jadwal mendatang
    if (when && state === "pending") {
      upcoming.push({
        id: schedule.id,
        title: schedule.title,
        scheduled_for: when.toISOString(),
        schedule_platforms: platforms,
        ts: when.getTime(),
      });
    }
  }

  for (const year of yearSet) {
    monthlyByYear[String(year)] ??= emptyYear();
  }

  const years = [...yearSet].sort((a, b) => a - b);

  const upcomingSchedules = upcoming
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 3)
    .map(({ ts: _ts, ...item }) => item);

  // =========================================================
  // 4. Tampilkan Dashboard
  // =========================================================

  return (
    <DashboardPage
      stats={stats}
      platformStats={platformStats}
      monthlyByYear={monthlyByYear}
      years={years}
      upcomingSchedules={upcomingSchedules}
    />
  );
}