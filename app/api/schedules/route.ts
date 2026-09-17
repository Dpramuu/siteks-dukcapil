import { NextResponse, type NextRequest } from "next/server";

import { randomUUID } from "crypto";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import type { ScheduleInsert } from "@/app/components/schedules/types";

const PLATFORMS = ["Instagram", "TikTok", "Twitter"] as const;

// Konversi ISO date menjadi format MySQL DATETIME
function toMySQLDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// POST /api/schedules
export async function POST(request: NextRequest) {
  try {
    // =====================================================
    // 1. Ambil user dari session lokal
    // =====================================================

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =====================================================
    // 2. Ambil data dari request
    // =====================================================

    const body: ScheduleInsert = await request.json();

    // =====================================================
    // 3. Validasi data
    // =====================================================

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title wajib diisi" }, { status: 400 });
    }

    if (
      body.status !== undefined &&
      body.status !== "draft" &&
      body.status !== "scheduled" &&
      body.status !== "published"
    ) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 },
      );
    }

    // =====================================================
    // 4. Konversi scheduled_for ke format MySQL
    // =====================================================

    const scheduledFor = toMySQLDateTime(body.scheduled_for);

    // =====================================================
    // 5. Buat ID schedule
    // =====================================================

    const scheduleId = randomUUID();

    // =====================================================
    // 6. Insert schedule ke MySQL
    // =====================================================

    await pool.execute(
      `
      INSERT INTO schedules (
        id,
        user_id,
        template_id,
        title,
        caption,
        status,
        scheduled_for
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        scheduleId,
        userId,
        body.template_id ?? null,
        body.title.trim(),
        body.caption?.trim() || null,
        body.status ?? "scheduled",
        scheduledFor,
      ],
    );

    // =====================================================
    // 7. Otomatis insert 3 platform
    // =====================================================

    for (const platform of PLATFORMS) {
      await pool.execute(
        `
        INSERT INTO schedule_platforms (
          id,
          schedule_id,
          platform,
          is_uploaded,
          uploaded_at
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [randomUUID(), scheduleId, platform, false, null],
      );
    }

    // =====================================================
    // 8. Ambil schedule yang baru dibuat
    // =====================================================

    const [scheduleRows] = await pool.execute(
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
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [scheduleId, userId],
    );

    const schedules = scheduleRows as any[];

    if (schedules.length === 0) {
      return NextResponse.json(
        {
          error: "Schedule gagal ditemukan setelah dibuat",
        },
        { status: 500 },
      );
    }

    const schedule = schedules[0];

    // =====================================================
    // 9. Ambil semua platform schedule
    // =====================================================

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
      WHERE schedule_id = ?
      ORDER BY created_at ASC
      `,
      [scheduleId],
    );

    const platforms = platformRows as any[];

    // =====================================================
    // 10. Gabungkan schedule + platform
    // =====================================================

    const full = {
      ...schedule,
      schedule_platforms: platforms,
    };

    // =====================================================
    // 11. Return response
    // =====================================================

    return NextResponse.json(full, {
      status: 201,
    });
  } catch (error) {
    console.error("SCHEDULE CREATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membuat schedule",
      },
      { status: 500 },
    );
  }
}
