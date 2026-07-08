import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { sendCommentPush, sendMessagePush } from "@/lib/push/service";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/validate";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const userLimit = checkRateLimit(`push-notify:${auth.uid}`, 30, 60 * 1000);
  if (!userLimit.ok) return rateLimitResponse(userLimit.retryAfterSec!);

  if (await isUidBanned(auth.uid)) {
    return NextResponse.json({ error: "Hesabınız yasaklanmış." }, { status: 403 });
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists || userSnap.data()?.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Onaylı hesap gerekli." }, { status: 403 });
  }

  const senderUsername = userSnap.data()?.username as string;
  let body: { type?: string; conversationId?: string; postId?: string; preview?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const type = body.type;
  const preview = sanitizeText(String(body.preview ?? "").trim(), 200);

  if (type === "message") {
    const conversationId =
      typeof body.conversationId === "string" ? body.conversationId.trim() : "";
    if (!conversationId || preview.length < 1) {
      return NextResponse.json({ error: "Geçersiz mesaj bildirimi." }, { status: 400 });
    }

    const convSnap = await getAdminDb().collection("conversations").doc(conversationId).get();
    if (!convSnap.exists) {
      return NextResponse.json({ error: "Sohbet bulunamadı." }, { status: 404 });
    }

    const participants = (convSnap.data()?.participantUids as string[]) ?? [];
    if (!participants.includes(auth.uid)) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const recipientUids = participants.filter((uid) => uid !== auth.uid);
    const result = await sendMessagePush({
      recipientUids,
      senderUsername,
      conversationId,
      preview,
    });

    return NextResponse.json({ success: true, ...result });
  }

  if (type === "comment") {
    const postId = typeof body.postId === "string" ? body.postId.trim() : "";
    if (!postId || preview.length < 1) {
      return NextResponse.json({ error: "Geçersiz yorum bildirimi." }, { status: 400 });
    }

    const postSnap = await getAdminDb().collection("posts").doc(postId).get();
    if (!postSnap.exists) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }

    const postAuthorUid = postSnap.data()?.authorUid as string;
    if (postAuthorUid === auth.uid) {
      return NextResponse.json({ success: true, sent: 0, failed: 0 });
    }

    const result = await sendCommentPush({
      postAuthorUid,
      commenterUsername: senderUsername,
      postId,
      preview,
    });

    return NextResponse.json({ success: true, ...result });
  }

  return NextResponse.json({ error: "Geçersiz bildirim türü." }, { status: 400 });
}
