import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  const { username, password } = await request.json();

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return NextResponse.json(
      { error: "Admin yapılandırması eksik." },
      { status: 500 }
    );
  }

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı adı veya şifre." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  setAdminSessionCookie(response);
  return response;
}
