import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { saveFcmToken } from "@/lib/push/service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`push-register:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (await isUidBanned(auth.uid)) {
    return NextResponse.json({ error: "Hesabınız yasaklanmış." }, { status: 403 });
  }

  let body: { token?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (typeof body.token !== "string" || body.token.length < 20 || body.token.length > 4096) {
    return NextResponse.json({ error: "Geçersiz token." }, { status: 400 });
  }

  await saveFcmToken({
    uid: auth.uid,
    token: body.token,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ success: true });
}
