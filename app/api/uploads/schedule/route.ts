import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // ==========================================
    // 1. Validasi file
    // ==========================================

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "File tidak ditemukan.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Ukuran file melebihi batas maksimal 10 MB.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // 2. Buat nama file unik
    // ==========================================

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filename = `${randomUUID()}.${extension}`;

    // ==========================================
    // 3. File → Buffer
    // ==========================================

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ==========================================
    // 4. Simpan file secara lokal
    // ==========================================

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "schedules",
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    // ==========================================
    // 5. URL publik
    // ==========================================

    const localUrl = `/uploads/schedules/${filename}`;

    // ==========================================
    // 6. Response
    // ==========================================

    return NextResponse.json({
      success: true,
      url: localUrl,
      filename,
    });
  } catch (error) {
    console.error("Error uploading schedule photo:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan pada server saat mengunggah file.",
      },
      { status: 500 },
    );
  }
}
