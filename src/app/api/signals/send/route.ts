import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { createEmergencySignal } from "@/lib/signals/service";
import { assertSafeContent } from "@/lib/security/content-filter";
import { isValidSignalLocation } from "@/lib/geolocation";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`signal:${ip}`, 5, 60 * 60 * 1000);
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

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });
  }

  const userData = userSnap.data()!;
  if (userData.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Doğrulama gerekli." }, { status: 403 });
  }

  let body: { message?: string; location?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  let message: string | undefined;
  if (typeof body.message === "string" && body.message.trim()) {
    try {
      const trimmed = body.message.trim().slice(0, 280);
      assertSafeContent(trimmed);
      message = trimmed;
    } catch {
      return NextResponse.json({ error: "Mesaj uygunsuz içerik içeriyor." }, { status: 400 });
    }
  }

  const location = isValidSignalLocation(body.location) ? body.location : null;

  const friendships = await getAdminDb()
    .collection("friendships")
    .where("status", "==", "accepted")
    .where("fromUid", "==", auth.uid)
    .get();

  const friendshipsTo = await getAdminDb()
    .collection("friendships")
    .where("status", "==", "accepted")
    .where("toUid", "==", auth.uid)
    .get();

  const notifyUids = new Set<string>();
  friendships.docs.forEach((d) => {
    const toUid = d.data().toUid as string;
    if (toUid) notifyUids.add(toUid);
  });
  friendshipsTo.docs.forEach((d) => {
    const fromUid = d.data().fromUid as string;
    if (fromUid) notifyUids.add(fromUid);
  });

  if (notifyUids.size === 0) {
    return NextResponse.json(
      { error: "Sinyal göndermek için en az bir arkadaşın olmalı." },
      { status: 400 }
    );
  }

  const signalId = await createEmergencySignal({
    uid: auth.uid,
    username: userData.username as string,
    message,
    location,
    notifyUids: [...notifyUids],
  });

  return NextResponse.json({
    success: true,
    signalId,
    friendCount: notifyUids.size,
    hasLocation: Boolean(location),
  });
}
