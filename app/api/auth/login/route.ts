import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        username,
        email,
        password_hash
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 },
      );
    }

    const user = users[0];

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
      },
      { status: 500 },
    );
  }
}
