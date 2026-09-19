import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // =====================================================
    // 1. Cek API Key
    // =====================================================
    const authHeader = request.headers.get("authorization");

    const expectedKey = process.env.N8N_API_KEY;

    if (!expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_API_KEY belum dikonfigurasi di server.",
        },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // =====================================================
    // 2. Ambil jadwal Instagram yang sudah waktunya
    // =====================================================
    const [rows] = await pool.execute(
      `
      SELECT
        s.id,
        s.user_id,
        s.template_id,
        s.title,
        s.caption,
        s.image_url,
        s.status,
        s.scheduled_for,
        sp.id AS schedule_platform_id,
        sp.platform,
        sp.is_uploaded,
        sp.uploaded_at
      FROM schedules s
      INNER JOIN schedule_platforms sp
        ON sp.schedule_id = s.id
      WHERE s.status = 'scheduled'
        AND sp.platform = 'Instagram'
        AND sp.is_uploaded = FALSE
        AND s.scheduled_for IS NOT NULL
        AND s.scheduled_for <= NOW()
        AND s.image_url IS NOT NULL
        AND s.image_url <> ''
      ORDER BY s.scheduled_for ASC
      `,
    );

    return NextResponse.json({
      success: true,
      count: (rows as any[]).length,
      schedules: rows,
    });
  } catch (error) {
    console.error("N8N SCHEDULE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil jadwal untuk n8n",
      },
      { status: 500 },
    );
  }
}