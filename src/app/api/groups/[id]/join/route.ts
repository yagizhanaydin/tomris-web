import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { requestJoinGroup } from "@/lib/chat/groups-public";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (await isUidBanned(auth.uid)) {
    return NextResponse.json({ error: "Hesabınız yasaklanmış." }, { status: 403 });
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists || userSnap.data()?.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Onaylı hesap gerekli." }, { status: 403 });
  }

  const username = userSnap.data()?.username as string;
  const { id: conversationId } = await params;

  try {
    const result = await requestJoinGroup(conversationId, auth.uid, username);
    if (result === "pending") {
      return NextResponse.json({ success: true, pending: true, conversationId });
    }
    return NextResponse.json({ success: true, pending: false, conversationId });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    if (code === "not_found") {
      return NextResponse.json({ error: "Grup bulunamadı." }, { status: 404 });
    }
    if (code === "not_group") {
      return NextResponse.json({ error: "Geçersiz grup." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gruba katılınamadı." }, { status: 500 });
  }
}
