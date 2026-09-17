import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        DATABASE() AS database_name,
        CURRENT_USER() AS db_user
      `,
    );

    const result = (rows as any[])[0];

    return NextResponse.json({
      success: true,
      message: "MySQL berhasil terhubung",
      database: result.database_name,
      user: result.db_user,
    });
  } catch (error) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal terhubung ke MySQL",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
