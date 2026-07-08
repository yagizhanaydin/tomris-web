import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { listJoinRequests } from "@/lib/chat/groups-public";

export async function GET(
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

  const { id: conversationId } = await params;

  try {
    const requests = await listJoinRequests(conversationId, auth.uid);
    return NextResponse.json({ requests });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    if (code === "not_found") {
      return NextResponse.json({ error: "Grup bulunamadı." }, { status: 404 });
    }
    if (code === "not_leader") {
      return NextResponse.json({ error: "Yalnızca grup lideri istekleri görebilir." }, { status: 403 });
    }
    return NextResponse.json({ error: "İstekler yüklenemedi." }, { status: 500 });
  }
}
