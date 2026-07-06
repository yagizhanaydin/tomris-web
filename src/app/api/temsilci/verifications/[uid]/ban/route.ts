import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { banUser } from "@/lib/ban/service";

const VALID_REASONS = [
  "Uygunsuz içerik (troll)",
  "Sahte profil / cinsiyet uyumsuzluğu",
  "Tekrarlayan kötü niyetli davranış",
] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_JSON yapılandırılmamış." },
      { status: 500 }
    );
  }

  const { uid } = await params;
  const body = await request.json().catch(() => ({}));
  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : VALID_REASONS[0];

  const repUsername = process.env.REP_USERNAME ?? "temsilci";

  try {
    await banUser(uid, repUsername, reason);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "user_not_found") {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ error: "Yasaklama başarısız." }, { status: 500 });
  }
}
