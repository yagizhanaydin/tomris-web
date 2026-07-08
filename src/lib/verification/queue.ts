import { getAdminDb } from "@/lib/firebase-admin";

export type VerificationQueueStatus = {
  position: number;
  total: number;
};

export async function getVerificationQueueStatus(
  uid: string
): Promise<VerificationQueueStatus | null> {
  const snap = await getAdminDb()
    .collection("users")
    .where("verificationStatus", "==", "pending")
    .get();

  const pending = snap.docs
    .map((d) => ({
      uid: d.id,
      submittedAt:
        (d.data().verificationSubmittedAt as string | undefined) ||
        (d.data().createdAt as string) ||
        "",
    }))
    .filter((row) => row.submittedAt)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  const index = pending.findIndex((row) => row.uid === uid);
  if (index === -1) return null;

  return {
    position: index + 1,
    total: pending.length,
  };
}
