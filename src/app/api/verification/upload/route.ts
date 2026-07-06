import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, isAdminConfigured } from "@/lib/firebase-admin";
import { saveLocalPhoto } from "@/lib/verification/local-storage";
import { isUidBanned } from "@/lib/ban/service";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (FIREBASE_SERVICE_ACCOUNT_JSON)." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });
  }

  if (await isUidBanned(uid)) {
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
  await saveLocalPhoto(uid, buffer);

  return NextResponse.json({ success: true, uid });
}
