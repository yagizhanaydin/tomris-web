import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-token";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { isUidBanned } from "@/lib/ban/service";
import { sanitizeText } from "@/lib/security/validate";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import type { ReportMessageContext, ReportTargetType } from "@/types/report";

const VALID_TARGETS: ReportTargetType[] = ["post", "comment", "user", "conversation"];
const MESSAGE_CONTEXT_LIMIT = 5;

async function fetchConversationMessageContext(
  conversationId: string,
  uid: string
): Promise<ReportMessageContext[]> {
  const db = getAdminDb();
  const convSnap = await db.collection("conversations").doc(conversationId).get();
  if (!convSnap.exists) throw new Error("conversation_not_found");

  const participants = (convSnap.data()?.participantUids as string[]) ?? [];
  if (!participants.includes(uid)) throw new Error("forbidden");

  const msgSnap = await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(MESSAGE_CONTEXT_LIMIT)
    .get();

  return msgSnap.docs
    .map((d) => {
      const data = d.data();
      return {
        messageId: d.id,
        authorUid: data.authorUid as string,
        authorUsername: data.authorUsername as string,
        content: String(data.content ?? "").slice(0, 500),
        createdAt: data.createdAt as string,
      };
    })
    .reverse();
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const auth = await verifyFirebaseIdToken(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const userLimit = checkRateLimit(`report:user:${auth.uid}`, 10, 60 * 60 * 1000);
  if (!userLimit.ok) return rateLimitResponse(userLimit.retryAfterSec!);

  if (await isUidBanned(auth.uid)) {
    return NextResponse.json({ error: "Hesabınız yasaklanmış." }, { status: 403 });
  }

  const userSnap = await getAdminDb().collection("users").doc(auth.uid).get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });
  }

  const profile = userSnap.data()!;
  if (profile.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Onaylı hesap gerekli." }, { status: 403 });
  }

  let body: {
    targetType?: ReportTargetType;
    targetId?: string;
    targetAuthorUid?: string;
    reason?: string;
    conversationId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const targetType = body.targetType;
  const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
  const reason = sanitizeText(String(body.reason ?? "").trim(), 500);

  if (!targetType || !VALID_TARGETS.includes(targetType) || !targetId) {
    return NextResponse.json({ error: "Geçersiz hedef." }, { status: 400 });
  }
  if (reason.length < 5) {
    return NextResponse.json({ error: "Açıklama en az 5 karakter olmalı." }, { status: 400 });
  }

  const targetAuthorUid =
    typeof body.targetAuthorUid === "string" ? body.targetAuthorUid.trim() : null;

  if (targetAuthorUid === auth.uid) {
    return NextResponse.json({ error: "Kendi içeriğinizi şikayet edemezsiniz." }, { status: 400 });
  }

  let messageContext: ReportMessageContext[] | null = null;
  let conversationId: string | null = null;

  if (targetType === "conversation") {
    conversationId = targetId;
    try {
      messageContext = await fetchConversationMessageContext(targetId, auth.uid);
    } catch (err) {
      const code = err instanceof Error ? err.message : "error";
      if (code === "conversation_not_found") {
        return NextResponse.json({ error: "Sohbet bulunamadı." }, { status: 404 });
      }
      if (code === "forbidden") {
        return NextResponse.json({ error: "Bu sohbete erişiminiz yok." }, { status: 403 });
      }
      return NextResponse.json({ error: "Mesaj bağlamı alınamadı." }, { status: 500 });
    }
  }

  const db = getAdminDb();
  const reportRef = await db.collection("reports").add({
    reporterUid: auth.uid,
    reporterUsername: profile.username,
    targetType,
    targetId,
    targetAuthorUid,
    reason,
    conversationId,
    messageContext,
    status: "open",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, reportId: reportRef.id });
}
