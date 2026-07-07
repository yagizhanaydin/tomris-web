import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

type RouteContext = { params: Promise<{ signalId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`signal-resolve:${ip}`, 30, 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { signalId } = await context.params;
  const ref = getAdminDb().collection("signals").doc(signalId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Sinyal bulunamadı." }, { status: 404 });
  }

  const data = snap.data()!;
  const notifyUids = (data.notifyUids as string[]) ?? [];
  const isSender = data.uid === auth.uid;
  const isRecipient = notifyUids.includes(auth.uid);
  if (!isSender && !isRecipient) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await ref.update({ status: "resolved" });
  return NextResponse.json({ success: true });
}
