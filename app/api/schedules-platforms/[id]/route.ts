import { NextResponse, type NextRequest } from "next/server";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // =====================================================
    // 1. Ambil ID platform
    // =====================================================

    const { id } = await params;

    // =====================================================
    // 2. Ambil user dari session lokal
    // =====================================================

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =====================================================
    // 3. Ambil data dari request
    // =====================================================

    const body: { is_uploaded: boolean } = await request.json();

    const isUploaded = Boolean(body.is_uploaded);

    // =====================================================
    // 4. Cari platform sekaligus pastikan milik user
    // =====================================================

    const [platformRows] = await pool.execute(
      `
      SELECT
        sp.id,
        sp.schedule_id,
        sp.platform,
        sp.is_uploaded,
        sp.uploaded_at,
        sp.created_at,
        sp.updated_at
      FROM schedule_platforms sp
      INNER JOIN schedules s
        ON s.id = sp.schedule_id
      WHERE sp.id = ?
        AND s.user_id = ?
      LIMIT 1
      `,
      [id, userId],
    );

    const platforms = platformRows as any[];

    if (platforms.length === 0) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    const existingPlatform = platforms[0];

    const scheduleId = existingPlatform.schedule_id;

    // =====================================================
    // 5. Update is_uploaded
    // =====================================================

    await pool.execute(
      `
      UPDATE schedule_platforms
      SET
        is_uploaded = ?,
        uploaded_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [isUploaded, isUploaded ? new Date() : null, id],
    );

    // =====================================================
    // 6. Ambil semua platform untuk schedule
    // =====================================================

    const [allPlatformRows] = await pool.execute(
      `
        SELECT
          is_uploaded
        FROM schedule_platforms
        WHERE schedule_id = ?
        `,
      [scheduleId],
    );

    const allPlatforms = allPlatformRows as {
      is_uploaded: boolean;
    }[];

    // =====================================================
    // 7. Cek apakah semua platform sudah uploaded
    // =====================================================

    const allUploaded =
      allPlatforms.length > 0 &&
      allPlatforms.every((platform) => Boolean(platform.is_uploaded));

    const newStatus = allUploaded ? "published" : "scheduled";

    // =====================================================
    // 8. Update status schedule
    // =====================================================

    await pool.execute(
      `
      UPDATE schedules
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
      `,
      [newStatus, scheduleId, userId],
    );

    // =====================================================
    // 9. Ambil platform yang sudah diperbarui
    // =====================================================

    const [resultRows] = await pool.execute(
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
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    const result = resultRows as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Platform tidak ditemukan" },
        { status: 404 },
      );
    }

    // =====================================================
    // 10. Return response
    // =====================================================

    return NextResponse.json({
      platform: result[0],
      status: newStatus,
    });
  } catch (error) {
    console.error("SCHEDULE PLATFORM UPDATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui platform",
      },
      { status: 500 },
    );
  }
}
