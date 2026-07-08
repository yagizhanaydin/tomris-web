import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { saveVerificationPhoto, getVerificationPhotoBackend } from "@/lib/verification/photo-storage";
import { prepareVerificationPhoto } from "@/lib/verification/compress-verification-photo";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`upload:${ip}`, 10, 60 * 1000);
  if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (FIREBASE_SERVICE_ACCOUNT_JSON)." },
      { status: 500 }
    );
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (await isUidBanned(auth.uid)) {
    return NextResponse.json(
      { error: "Hesabınız platformdan yasaklanmıştır." },
      { status: 403 }
    );
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  const status = userSnap.data()?.verificationStatus as string | undefined;
  if (status === "approved" || status === "banned") {
    return NextResponse.json(
      { error: "Bu hesap için doğrulama fotoğrafı yüklenemez." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const privacyConsent = formData.get("privacyConsent");
  if (privacyConsent !== "true") {
    return NextResponse.json(
      { error: "Gizlilik onayı gerekli." },
      { status: 400 }
    );
  }

  const file = formData.get("photo");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Fotoğraf gerekli." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fotoğraf çok büyük (max 5MB)." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Geçersiz dosya türü." }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let buffer: Buffer;
  try {
    buffer =
      getVerificationPhotoBackend() === "firestore"
        ? prepareVerificationPhoto(rawBuffer)
        : rawBuffer;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fotoğraf işlenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await saveVerificationPhoto(auth.uid, buffer);

  const now = new Date().toISOString();
  await getAdminDb().collection("users").doc(auth.uid).update({
    verificationPhotoPath: auth.uid,
    verificationStatus: "pending",
    genderVerified: false,
    verificationSubmittedAt: now,
    verificationPrivacyConsentAt: now,
    verificationPrivacyVersion: "2026-07-08",
  });

  return NextResponse.json({ success: true, uid: auth.uid });
}
