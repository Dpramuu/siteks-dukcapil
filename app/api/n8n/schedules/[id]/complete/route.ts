import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.N8N_API_KEY;

    if (!expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_API_KEY belum dikonfigurasi di server.",
        },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Schedule ID wajib diisi.",
        },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [scheduleResult] = await connection.execute(
        `
        UPDATE schedules
        SET status = 'published'
        WHERE id = ?
        `,
        [id]
      );

      const [platformResult] = await connection.execute(
        `
        UPDATE schedule_platforms
        SET
          is_uploaded = TRUE,
          uploaded_at = NOW()
        WHERE schedule_id = ?
          AND platform = 'Instagram'
        `,
        [id]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Jadwal berhasil ditandai sebagai published.",
        schedule_id: id,
        schedule_updated: (scheduleResult as any).affectedRows,
        platform_updated: (platformResult as any).affectedRows,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("N8N COMPLETE SCHEDULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status jadwal.",
      },
      { status: 500 }
    );
  }
}