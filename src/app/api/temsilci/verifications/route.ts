import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { listPendingVerifications } from "@/lib/verification/service";

export async function GET(request: NextRequest) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_JSON yapılandırılmamış." },
      { status: 500 }
    );
  }

  try {
    const pending = await listPendingVerifications();
    // Temsilci yalnızca doğrulama için gerekli alanları görür — e-posta/şifre asla gönderilmez
    const safe = pending.map(({ email: _email, ...rest }) => rest);
    return NextResponse.json({ pending: safe });
  } catch {
    return NextResponse.json({ error: "Liste alınamadı." }, { status: 500 });
  }
}
