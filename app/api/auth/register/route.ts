import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email, dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter",
        },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    const existingUsers = rows as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();

    await pool.execute(
      `
      INSERT INTO users (
        id,
        username,
        email,
        password_hash
      )
      VALUES (?, ?, ?, ?)
      `,
      [userId, username, email, passwordHash],
    );

    await createSession(userId);

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      user: {
        id: userId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
      },
      { status: 500 },
    );
  }
}
