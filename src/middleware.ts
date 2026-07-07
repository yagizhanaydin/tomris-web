import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  REP_COOKIE,
  isAdminSessionEdge,
  isRepSessionEdge,
} from "@/lib/auth/session-edge";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const global = checkRateLimit(`api:${ip}`, 120, 60 * 1000);
    if (!global.ok) {
      return NextResponse.json(
        { error: "Çok fazla istek." },
        { status: 429, headers: { "Retry-After": String(global.retryAfterSec) } }
      );
    }

    if (
      pathname.startsWith("/api/temsilci/") &&
      pathname !== "/api/temsilci/login" &&
      pathname !== "/api/temsilci/logout" &&
      !(await isRepSessionEdge(request))
    ) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    if (!(await isAdminSessionEdge(request))) {
      return NextResponse.redirect(new URL("/admin/giris", request.url));
    }
  }

  if (pathname.startsWith("/temsilci") && pathname !== "/temsilci/giris") {
    if (!(await isRepSessionEdge(request))) {
      return NextResponse.redirect(new URL("/temsilci/giris", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/temsilci/:path*", "/api/:path*"],
};
