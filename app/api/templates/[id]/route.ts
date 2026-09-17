import { NextResponse, type NextRequest } from "next/server";

import { pool } from "@/lib/db";

import { getSessionUserId } from "@/lib/auth";

import type { TemplateUpdate } from "@/app/components/template/types";

// PATCH /api/templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Ambil user dari session lokal
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil ID template
    const { id } = await params;

    // Ambil data dari request
    const body: TemplateUpdate = await request.json();

    // =====================================================
    // Validasi data
    // =====================================================

    if (
      body.name === undefined &&
      body.platform === undefined &&
      body.content === undefined
    ) {
      return NextResponse.json(
        { error: "Tidak ada data yang diperbarui" },
        { status: 400 },
      );
    }

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: "name wajib diisi" }, { status: 400 });
    }

    if (body.content !== undefined && !body.content.trim()) {
      return NextResponse.json(
        { error: "content wajib diisi" },
        { status: 400 },
      );
    }

    if (
      body.platform !== undefined &&
      body.platform !== "Instagram" &&
      body.platform !== "TikTok" &&
      body.platform !== "Twitter"
    ) {
      return NextResponse.json(
        { error: "Platform tidak valid" },
        { status: 400 },
      );
    }

    // =====================================================
    // Buat query UPDATE secara dinamis
    // =====================================================

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (body.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(body.name.trim());
    }

    if (body.platform !== undefined) {
      updateFields.push("platform = ?");
      updateValues.push(body.platform);
    }

    if (body.content !== undefined) {
      updateFields.push("content = ?");
      updateValues.push(body.content.trim());
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // Tambahkan ID dan user ID untuk WHERE
    updateValues.push(id);
    updateValues.push(userId);

    // =====================================================
    // Update template
    // =====================================================

    const [result] = await pool.execute(
      `
      UPDATE templates
      SET ${updateFields.join(", ")}
      WHERE id = ?
        AND user_id = ?
      `,
      updateValues,
    );

    const updateResult = result as {
      affectedRows: number;
    };

    // Template tidak ditemukan / bukan milik user
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 },
      );
    }

    // =====================================================
    // Ambil data template setelah diperbarui
    // =====================================================

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
        AND user_id = ?
      LIMIT 1
      `,
      [id, userId],
    );

    const templates = rows as any[];

    if (templates.length === 0) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(templates[0]);
  } catch (error) {
    console.error("TEMPLATE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui template",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/templates/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Ambil user dari session lokal
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil ID template
    const { id } = await params;

    // =====================================================
    // Hapus template
    // =====================================================

    const [result] = await pool.execute(
      `
      DELETE FROM templates
      WHERE id = ?
        AND user_id = ?
      `,
      [id, userId],
    );

    const deleteResult = result as {
      affectedRows: number;
    };

    // Template tidak ditemukan / bukan milik user
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 },
      );
    }

    // Berhasil dihapus
    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    console.error("TEMPLATE DELETE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus template",
      },
      { status: 500 },
    );
  }
}
