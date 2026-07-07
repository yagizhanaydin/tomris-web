import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { normalizeUsername } from "@/lib/security/validate";
import { isValidUsernameSearchQuery } from "@/lib/security/username";
import { isSafeContent } from "@/lib/security/content-filter";

const SEARCH_MIN = 2;
const DEFAULT_LIMIT = 8;

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists || userSnap.data()?.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Onaylı hesap gerekli." }, { status: 403 });
  }

  const prefix = normalizeUsername(request.nextUrl.searchParams.get("prefix") ?? "");
  const excludeUid = request.nextUrl.searchParams.get("excludeUid") ?? auth.uid;
  const limit = Math.min(
    20,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT))
  );

  if (prefix.length < SEARCH_MIN || !isValidUsernameSearchQuery(prefix)) {
    return NextResponse.json({ users: [] });
  }

  const snap = await getAdminDb()
    .collection("users")
    .where("verificationStatus", "==", "approved")
    .where("username", ">=", prefix)
    .where("username", "<=", prefix + "\uf8ff")
    .orderBy("username")
    .limit(limit + 4)
    .get();

  const users: { uid: string; username: string }[] = [];

  for (const docSnap of snap.docs) {
    if (docSnap.id === excludeUid) continue;
    const username = docSnap.data().username as string;
    if (!isSafeContent(username)) continue;
    users.push({ uid: docSnap.id, username });
    if (users.length >= limit) break;
  }

  return NextResponse.json({ users });
}
