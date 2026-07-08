import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { kickGroupMember } from "@/lib/chat/groups-public";

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
    await kickGroupMember(conversationId, auth.uid, targetUid);
    return NextResponse.json({ success: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    if (code === "not_leader") {
      return NextResponse.json({ error: "Yalnızca grup lideri üye çıkarabilir." }, { status: 403 });
    }
    if (code === "cannot_kick_self") {
      return NextResponse.json({ error: "Kendinizi gruptan çıkaramazsınız; ayrılın." }, { status: 400 });
    }
    return NextResponse.json({ error: "Üye çıkarılamadı." }, { status: 500 });
  }
}
