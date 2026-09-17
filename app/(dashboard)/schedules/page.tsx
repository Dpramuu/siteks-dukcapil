import { redirect } from "next/navigation";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import SchedulePage from "./SchedulePage";

import type { Schedule, Template } from "@/app/components/schedules/types";

export default async function ScheduleRoute() {
  // =====================================================
  // 1. Ambil user dari session lokal
  // =====================================================

  const userId = await getSessionUserId();

  // Belum login → ke halaman login
  if (!userId) {
    redirect("/login");
  }

  // =====================================================
  // 2. Ambil schedules dan templates dari MySQL
  // =====================================================

  const [scheduleRows, templateRows] = await Promise.all([
    pool.execute(
      `
        SELECT
          id,
          user_id,
          template_id,
          title,
          caption,
          status,
          scheduled_for,
          created_at,
          updated_at
        FROM schedules
        WHERE user_id = ?
        ORDER BY
          scheduled_for IS NULL ASC,
          scheduled_for ASC
        `,
      [userId],
    ),

    pool.execute(
      `
        SELECT
          id,
          user_id,
          name,
          content,
          platform,
          created_at,
          updated_at
        FROM templates
        WHERE user_id = ?
        ORDER BY name ASC
        `,
      [userId],
    ),
  ]);

  // =====================================================
  // 3. Ambil hasil query
  // =====================================================

  const schedulesData = scheduleRows[0] as any[];

  const templatesData = templateRows[0] as any[];

  // =====================================================
  // 4. Ambil schedule_platforms
  // =====================================================

  let schedulesWithPlatforms = schedulesData;

  if (schedulesData.length > 0) {
    const scheduleIds = schedulesData.map((schedule) => schedule.id);

    const placeholders = scheduleIds.map(() => "?").join(", ");

    const [platformRows] = await pool.execute(
      `
      SELECT
        id,
        schedule_id,
        platform,
        is_uploaded,
        uploaded_at,
        created_at,
        updated_at
      FROM schedule_platforms
      WHERE schedule_id IN (${placeholders})
      ORDER BY created_at ASC
      `,
      scheduleIds,
    );

    const platforms = platformRows as any[];

    // ===================================================
    // 5. Gabungkan schedules + schedule_platforms
    // ===================================================

    schedulesWithPlatforms = schedulesData.map((schedule) => ({
      ...schedule,
      schedule_platforms: platforms
        .filter((platform) => platform.schedule_id === schedule.id)
        .map((platform) => ({
          id: platform.id,
          schedule_id: platform.schedule_id,
          platform: platform.platform,
          is_uploaded: Boolean(platform.is_uploaded),
          uploaded_at: platform.uploaded_at,
          created_at: platform.created_at,
          updated_at: platform.updated_at,
        })),
    }));
  }

  // =====================================================
  // 6. Tampilkan SchedulePage
  // =====================================================

  return (
    <SchedulePage
      initialSchedules={schedulesWithPlatforms as Schedule[]}
      initialTemplates={templatesData as Template[]}
      userId={userId}
    />
  );
}
