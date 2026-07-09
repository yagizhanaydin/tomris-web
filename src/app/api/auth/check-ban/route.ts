import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isEmailBanned } from "@/lib/ban/service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`check-ban:${ip}`, 20, 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  if (!isAdminConfigured()) {
    return NextResponse.json({ allowed: true });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email || email.length > 254) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  try {
    const banned = await isEmailBanned(email);
    return NextResponse.json({ allowed: !banned });
  } catch {
    return NextResponse.json({ allowed: true });
  }
}
