import { NextResponse, type NextRequest } from "next/server";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import type { TemplateInsert } from "@/app/components/template/types";

// POST /api/templates
export async function POST(request: NextRequest) {
  try {
    // Ambil user dari session lokal
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil data dari request
    const body: TemplateInsert = await request.json();

    // Validasi
    if (!body.name?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "name dan content wajib diisi" },
        { status: 400 },
      );
    }

    // Validasi platform
    if (
      body.platform !== "Instagram" &&
      body.platform !== "TikTok" &&
      body.platform !== "Twitter"
    ) {
      return NextResponse.json(
        { error: "Platform tidak valid" },
        { status: 400 },
      );
    }

    // Buat ID UUID
    const { randomUUID } = await import("crypto");

    const templateId = randomUUID();

    // Simpan ke MySQL
    await pool.execute(
      `
      INSERT INTO templates (
        id,
        user_id,
        name,
        content,
        platform
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        templateId,
        userId,
        body.name.trim(),
        body.content.trim(),
        body.platform,
      ],
    );

    // Ambil kembali data yang baru dibuat
    const [rows] = await pool.execute(
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
      WHERE id = ?
      LIMIT 1
      `,
      [templateId],
    );

    const templates = rows as any[];

    if (templates.length === 0) {
      return NextResponse.json(
        { error: "Template berhasil disimpan tetapi gagal mengambil data" },
        { status: 500 },
      );
    }

    return NextResponse.json(templates[0], { status: 201 });
  } catch (error) {
    console.error("TEMPLATE CREATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membuat template",
      },
      { status: 500 },
    );
  }
}
