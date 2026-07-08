import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { leaveGroupAsUser } from "@/lib/chat/groups-public";

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

  const { id: conversationId } = await params;

  try {
    await leaveGroupAsUser(conversationId, auth.uid);
    return NextResponse.json({ success: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    if (code === "not_found") {
      return NextResponse.json({ error: "Grup bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gruptan ayrılınamadı." }, { status: 500 });
  }
}
