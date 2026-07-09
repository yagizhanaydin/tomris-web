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

    const probeId = `_health_${Date.now()}`;
    const probeRef = getAdminDb().collection("verification_photos").doc(probeId);
    await probeRef.set({
      imageBase64: "a",
      contentType: "image/jpeg",
      createdAt: new Date().toISOString(),
    });
    await probeRef.delete();

    return NextResponse.json({ ok: true, code: "OK", photos: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore erişilemedi.";
    return NextResponse.json(
      { ok: false, code: "SERVER_FAULT", error: message },
      { status: 500 }
    );
  }
}
