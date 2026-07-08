import { createHash } from "node:crypto";
import { getMessaging } from "firebase-admin/messaging";
import { getAdminApp, getAdminDb, isAdminConfigured } from "@/lib/firebase-admin";

export type PushPayload = {
  uids: string[];
  title: string;
  body: string;
  url: string;
  type: string;
  data?: Record<string, string>;
};

export type PushTokenRecord = {
  uid: string;
  token: string;
  platform: "web";
  updatedAt: string;
  userAgent?: string;
};

function tokenDocId(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveFcmToken(input: {
  uid: string;
  token: string;
  userAgent?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await getAdminDb()
    .collection("fcm_tokens")
    .doc(tokenDocId(input.token))
    .set({
      uid: input.uid,
      token: input.token,
      platform: "web",
      updatedAt: now,
      userAgent: input.userAgent ?? undefined,
    } satisfies PushTokenRecord);
}

export async function removeFcmTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  const batch = getAdminDb().batch();
  for (const token of tokens) {
    batch.delete(getAdminDb().collection("fcm_tokens").doc(tokenDocId(token)));
  }
  await batch.commit();
}

async function getTokensForUids(uids: string[]): Promise<string[]> {
  if (uids.length === 0) return [];
  const unique = [...new Set(uids)];
  const tokens = new Set<string>();

  for (let i = 0; i < unique.length; i += 10) {
    const chunk = unique.slice(i, i + 10);
    const snap = await getAdminDb()
      .collection("fcm_tokens")
      .where("uid", "in", chunk)
      .get();
    snap.docs.forEach((doc) => {
      const token = doc.data().token as string | undefined;
      if (token) tokens.add(token);
    });
  }

  return [...tokens];
}

export async function sendPushToUids(
  input: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isAdminConfigured()) return { sent: 0, failed: 0 };

  const tokens = await getTokensForUids(input.uids);
  if (tokens.length === 0) return { sent: 0, failed: 0 };

  const messaging = getMessaging(getAdminApp());

  const res = await messaging.sendEachForMulticast({
    tokens,
    notification: { title: input.title, body: input.body },
    data: {
      url: input.url,
      type: input.type,
      ...input.data,
    },
    webpush: {
      fcmOptions: { link: input.url },
    },
  });

  const invalidTokens: string[] = [];
  res.responses.forEach((item, index) => {
    if (item.success) return;
    const code = item.error?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      invalidTokens.push(tokens[index]!);
    }
  });
  await removeFcmTokens(invalidTokens);

  return {
    sent: res.successCount,
    failed: res.failureCount,
  };
}

export async function sendSignalPush(input: {
  notifyUids: string[];
  senderUsername: string;
  signalId: string;
}): Promise<{ sent: number; failed: number }> {
  return sendPushToUids({
    uids: input.notifyUids,
    title: `@${input.senderUsername} acil sinyal gönderdi`,
    body: "Tomris — acil durum bildirimi. Uygulamayı aç; konuma gitme.",
    url: "/sinyal",
    type: "signal",
    data: { signalId: input.signalId },
  });
}

export async function sendVerificationApprovedPush(
  uid: string
): Promise<{ sent: number; failed: number }> {
  return sendPushToUids({
    uids: [uid],
    title: "Doğrulaman onaylandı ✓",
    body: "Artık gönderi, yorum ve mesajlaşma açık. Tomris'e hoş geldin!",
    url: "/dashboard",
    type: "verification_approved",
  });
}

export async function sendMessagePush(input: {
  recipientUids: string[];
  senderUsername: string;
  conversationId: string;
  preview: string;
}): Promise<{ sent: number; failed: number }> {
  const preview =
    input.preview.length > 80 ? `${input.preview.slice(0, 77)}...` : input.preview;
  return sendPushToUids({
    uids: input.recipientUids,
    title: `@${input.senderUsername} mesaj gönderdi`,
    body: preview,
    url: `/mesajlar/${input.conversationId}`,
    type: "message",
    data: { conversationId: input.conversationId },
  });
}

export async function sendCommentPush(input: {
  postAuthorUid: string;
  commenterUsername: string;
  postId: string;
  preview: string;
}): Promise<{ sent: number; failed: number }> {
  const preview =
    input.preview.length > 80 ? `${input.preview.slice(0, 77)}...` : input.preview;
  return sendPushToUids({
    uids: [input.postAuthorUid],
    title: `@${input.commenterUsername} gönderine yorum yaptı`,
    body: preview,
    url: "/akis",
    type: "comment",
    data: { postId: input.postId },
  });
}
