import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { deleteUserAccount } from "@/lib/account/delete-service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`delete-account:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: { confirm?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (body.confirm !== "DELETE") {
    return NextResponse.json(
      { error: "Onay metni hatalı. DELETE yazmalısınız." },
      { status: 400 }
    );
  }

  try {
    await deleteUserAccount(auth.uid);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Hesap silinemedi." }, { status: 500 });
  }
}
