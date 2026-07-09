import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { getAdminConfigError, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { saveVerificationPhoto, getVerificationPhotoBackend } from "@/lib/verification/photo-storage";
import { prepareVerificationPhoto } from "@/lib/verification/compress-verification-photo";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";
import {
  inferUploadErrorCodeFromMessage,
  type VerificationUploadErrorCode,
} from "@/lib/verification/upload-errors";

export const runtime = "nodejs";

function uploadErrorResponse(
  code: VerificationUploadErrorCode,
  error: string,
  status: number
) {
  return NextResponse.json({ error, code }, { status });
}

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`upload:${ip}`, 10, 60 * 1000);
    if (!limit.ok) return rateLimitResponse(limit.retryAfterSec!);

    const adminError = getAdminConfigError();
    if (adminError) {
      return uploadErrorResponse("SERVER_CONFIG", adminError, 500);
    }

    const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
    if (!auth) {
      return uploadErrorResponse("UNAUTHORIZED", "Yetkisiz.", 401);
    }

    if (await isUidBanned(auth.uid)) {
      return uploadErrorResponse(
        "FORBIDDEN",
        "Hesabınız platformdan yasaklanmıştır.",
        403
      );
    }

    const userRef = getAdminDb().collection("users").doc(auth.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return uploadErrorResponse(
        "FORBIDDEN",
        "Kullanıcı profili bulunamadı. Çıkış yapıp kayıt akışını tamamlayın.",
        403
      );
    }

    const status = userSnap.data()?.verificationStatus as string | undefined;
    if (status === "approved" || status === "banned") {
      return uploadErrorResponse(
        "FORBIDDEN",
        "Bu hesap için doğrulama fotoğrafı yüklenemez.",
        403
      );
    }

    const formData = await request.formData();
    const privacyConsent = formData.get("privacyConsent");
    if (privacyConsent !== "true") {
      return uploadErrorResponse("CONSENT_REQUIRED", "Gizlilik onayı gerekli.", 400);
    }

    const file = formData.get("photo");

    if (!file || !(file instanceof Blob)) {
      return uploadErrorResponse("INVALID_FILE", "Fotoğraf gerekli.", 400);
    }

    if (file.size > MAX_SIZE) {
      return uploadErrorResponse("FILE_TOO_LARGE", "Fotoğraf çok büyük (max 5MB).", 400);
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    if (rawBuffer.length < 4) {
      return uploadErrorResponse("INVALID_FILE", "Fotoğraf boş veya bozuk.", 400);
    }

    const mime = file.type || "";
    if (mime && !mime.startsWith("image/")) {
      return uploadErrorResponse("INVALID_FILE", "Geçersiz dosya türü.", 400);
    }

    const backend = getVerificationPhotoBackend();
    let buffer: Buffer;
    try {
      buffer =
        backend === "firestore" || backend === "firebase"
          ? await prepareVerificationPhoto(rawBuffer)
          : rawBuffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fotoğraf işlenemedi.";
      return uploadErrorResponse("PROCESS_FAILED", message, 500);
    }

    try {
      await saveVerificationPhoto(auth.uid, buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fotoğraf kaydedilemedi.";
      return uploadErrorResponse("STORAGE_FAILED", message, 500);
    }

    const now = new Date().toISOString();
    await userRef.set(
      {
        verificationPhotoPath: auth.uid,
        verificationStatus: "pending",
        genderVerified: false,
        verificationSubmittedAt: now,
        verificationPrivacyConsentAt: now,
        verificationPrivacyVersion: "2026-07-08",
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, uid: auth.uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fotoğraf yüklenemedi.";
    const code = inferUploadErrorCodeFromMessage(message);
    console.error("[verification/upload]", code, err);
    return uploadErrorResponse(code, message, 500);
  }
}
