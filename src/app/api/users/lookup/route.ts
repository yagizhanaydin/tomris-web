import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const callerSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!callerSnap.exists || callerSnap.data()?.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Onaylı hesap gerekli." }, { status: 403 });
  }

  const normalized = normalizeUsername(request.nextUrl.searchParams.get("username") ?? "");
  if (!validateUsername(normalized)) {
    return NextResponse.json({ user: null });
  }

  const db = getAdminDb();
  const usernameSnap = await db.collection("usernames").doc(normalized).get();
  let uid: string | null = null;

  if (usernameSnap.exists) {
    uid = usernameSnap.data()?.uid as string;
  } else {
    const q = await db
      .collection("users")
      .where("username", "==", normalized)
      .where("verificationStatus", "==", "approved")
      .limit(1)
      .get();
    if (!q.empty) uid = q.docs[0].id;
  }

  if (!uid) return NextResponse.json({ user: null });

  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists || userSnap.data()?.verificationStatus !== "approved") {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { uid, username: userSnap.data()?.username as string },
  });
}
