import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { SIGNAL_SAFETY_ACK_VERSION } from "@/lib/signals/safety";

export async function POST(request: NextRequest) {
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

  let body: { version?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.version !== SIGNAL_SAFETY_ACK_VERSION) {
    return NextResponse.json({ error: "Geçersiz güvenlik sürümü." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await getAdminDb().collection("users").doc(auth.uid).update({
    signalSafetyIntroAckAt: now,
    signalSafetyIntroVersion: SIGNAL_SAFETY_ACK_VERSION,
  });

  return NextResponse.json({
    success: true,
    acknowledgedAt: now,
    version: SIGNAL_SAFETY_ACK_VERSION,
  });
}
