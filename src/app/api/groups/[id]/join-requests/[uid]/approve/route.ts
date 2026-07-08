import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { approveJoinRequest } from "@/lib/chat/groups-public";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; uid: string }> }
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

  const { id: conversationId, uid: targetUid } = await params;

  try {
    await approveJoinRequest(conversationId, auth.uid, targetUid);
    return NextResponse.json({ success: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    if (code === "not_leader") {
      return NextResponse.json({ error: "Yalnızca grup lideri onaylayabilir." }, { status: 403 });
    }
    if (code === "no_request") {
      return NextResponse.json({ error: "İstek bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ error: "Onaylanamadı." }, { status: 500 });
  }
}
