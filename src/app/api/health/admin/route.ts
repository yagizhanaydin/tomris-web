import { NextResponse } from "next/server";
import { getAdminConfigError, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/** Canlı ortamda Admin SDK / Firestore bağlantısını hızlı kontrol (gizli bilgi sızdırmaz) */
export async function GET() {
  const adminError = getAdminConfigError();
  if (adminError) {
    return NextResponse.json(
      { ok: false, code: "SERVER_CONFIG", error: adminError },
      { status: 500 }
    );
  }

  try {
    await getAdminDb().collection("users").limit(1).get();
    return NextResponse.json({ ok: true, code: "OK" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore erişilemedi.";
    return NextResponse.json(
      { ok: false, code: "SERVER_FAULT", error: message },
      { status: 500 }
    );
  }
}
