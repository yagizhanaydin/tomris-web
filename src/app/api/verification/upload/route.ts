import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { saveVerificationPhoto } from "@/lib/verification/photo-storage";
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

  const formData = await request.formData();
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

  const buffer = Buffer.from(await file.arrayBuffer());
  await saveVerificationPhoto(auth.uid, buffer);

  return NextResponse.json({ success: true, uid: auth.uid });
}
