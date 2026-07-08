import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { getVerificationQueueStatus } from "@/lib/verification/queue";

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });
  }

  const status = userSnap.data()?.verificationStatus;
  if (status !== "pending") {
    return NextResponse.json({ queue: null });
  }

  const queue = await getVerificationQueueStatus(auth.uid);
  return NextResponse.json({ queue });
}
