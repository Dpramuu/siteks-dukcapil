import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID Schedule diperlukan" }, { status: 400 });
    }

    // Pastikan schedule milik user tersebut
    const [rows] = await pool.execute(
      "SELECT id FROM schedules WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    const schedules = rows as any[];
    if (schedules.length === 0) {
      return NextResponse.json({ error: "Schedule tidak ditemukan atau Anda tidak memiliki akses" }, { status: 404 });
    }

    // Delete schedule platforms first
    await pool.execute("DELETE FROM schedule_platforms WHERE schedule_id = ?", [id]);

    // Delete schedule
    await pool.execute("DELETE FROM schedules WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Schedule berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("SCHEDULE DELETE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus schedule" },
      { status: 500 }
    );
  }
}
