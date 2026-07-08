import { getAdminDb } from "@/lib/firebase-admin";
import { resolveReport } from "@/lib/reports/admin";

export async function adminDeleteComment(commentId: string): Promise<void> {
  const ref = getAdminDb().collection("comments").doc(commentId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("not_found");
  await ref.delete();
}

export async function adminDeletePost(postId: string): Promise<void> {
  const db = getAdminDb();
  const postRef = db.collection("posts").doc(postId);
  const postSnap = await postRef.get();
  if (!postSnap.exists) throw new Error("not_found");

  const commentsSnap = await db.collection("comments").where("postId", "==", postId).get();
  const batch = db.batch();
  commentsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(postRef);
  await batch.commit();
}

export async function adminDeleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  const ref = getAdminDb()
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .doc(messageId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("not_found");
  await ref.delete();
}

export async function adminDeleteReportedContent(
  targetType: "post" | "comment" | "conversation",
  targetId: string,
  conversationId?: string | null
): Promise<void> {
  if (targetType === "post") {
    await adminDeletePost(targetId);
    return;
  }
  if (targetType === "comment") {
    await adminDeleteComment(targetId);
    return;
  }
  if (targetType === "conversation" && conversationId) {
    await adminDeleteMessage(conversationId, targetId);
    return;
  }
  throw new Error("invalid_target");
}

export async function adminResolveReport(reportId: string): Promise<void> {
  await resolveReport(reportId);
}

export async function getAdminStats(): Promise<{
  totalUsers: number;
  approvedUsers: number;
  pendingVerification: number;
  openReports: number;
}> {
  const db = getAdminDb();
  const [usersSnap, approvedSnap, pendingSnap, reportsSnap] = await Promise.all([
    db.collection("users").count().get(),
    db.collection("users").where("verificationStatus", "==", "approved").count().get(),
    db.collection("users").where("verificationStatus", "==", "pending").count().get(),
    db.collection("reports").where("status", "==", "open").count().get(),
  ]);

  return {
    totalUsers: usersSnap.data().count,
    approvedUsers: approvedSnap.data().count,
    pendingVerification: pendingSnap.data().count,
    openReports: reportsSnap.data().count,
  };
}
