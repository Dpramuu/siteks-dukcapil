import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "siteks_session";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

async function getUserIdFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get(COOKIE_NAME)?.value;

  const userId = await getUserIdFromToken(token);

  const protectedRoutes = ["/dashboard", "/template", "/schedules"];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Jika membuka halaman protected tanpa login
  if (isProtectedRoute && !userId) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Jika user sudah login tetapi mencoba membuka login
  if (pathname === "/login" && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/template/:path*",
    "/schedules/:path*",
    "/login",
  ],
};
