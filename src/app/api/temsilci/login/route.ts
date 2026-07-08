import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setRepSessionCookie } from "@/lib/auth/session";
import { verifyRepCredentials } from "@/lib/reps/service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`rep-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
  }

  let authenticatedUsername: string | null = null;

  const envUser = process.env.REP_USERNAME;
  const envPass = process.env.REP_PASSWORD;
  if (envUser && envPass && username === envUser && password === envPass) {
    authenticatedUsername = envUser;
  } else {
    authenticatedUsername = await verifyRepCredentials(username, password);
  }

  if (!authenticatedUsername) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı adı veya şifre." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  setRepSessionCookie(response, authenticatedUsername);
  return response;
}
