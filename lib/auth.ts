import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { pool } from "@/lib/db";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

const COOKIE_NAME = "siteks_session";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export async function createSession(
  userId: string,
  extra?: { username?: string; email?: string }
) {
  const payload: Record<string, any> = { userId };
  if (extra?.username) payload.username = extra.username;
  if (extra?.email) payload.email = extra.email;

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);

    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = typeof payload.userId === "string" ? payload.userId : null;

    if (!userId) return null;

    // Jika username & email sudah tersimpan di payload JWT
    if (
      typeof payload.username === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        id: userId,
        username: payload.username,
        email: payload.email,
      };
    }

    // Fallback: ambil dari database MySQL
    const [rows] = await pool.execute(
      "SELECT id, username, email FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const users = rows as SessionUser[];
    if (users.length === 0) return null;

    return {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
    };
  } catch (error) {
    console.error("Error retrieving session user:", error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

