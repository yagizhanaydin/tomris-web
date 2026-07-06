import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setRepSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`rep-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  const { username, password } = await request.json();

  const repUsername = process.env.REP_USERNAME;
  const repPassword = process.env.REP_PASSWORD;

  if (!repUsername || !repPassword) {
    return NextResponse.json(
      { error: "Temsilci yapılandırması eksik." },
      { status: 500 }
    );
  }

  if (username !== repUsername || password !== repPassword) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı adı veya şifre." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  setRepSessionCookie(response);
  return response;
}
