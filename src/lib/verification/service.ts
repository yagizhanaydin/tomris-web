import { getAdminDb } from "@/lib/firebase-admin";
import { deleteVerificationPhoto } from "@/lib/verification/photo-storage";
import { sendVerificationApprovedPush } from "@/lib/push/service";
import type { UserProfile, VerificationStatus } from "@/types/user";

export { getVerificationPhotoId } from "./paths";

export async function listPendingVerifications(): Promise<UserProfile[]> {
  const snap = await getAdminDb()
    .collection("users")
    .where("verificationStatus", "==", "pending")
    .get();

  return snap.docs
    .map((d) => d.data() as UserProfile)
    .sort((a, b) => {
      const aTime = a.verificationSubmittedAt || a.createdAt;
      const bTime = b.verificationSubmittedAt || b.createdAt;
      return aTime.localeCompare(bTime);
    });
}

async function finalizeReview(
  uid: string,
  status: VerificationStatus,
  repUsername: string
): Promise<void> {
  const ref = getAdminDb().collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("user_not_found");

  const profile = snap.data() as UserProfile;
  if (profile.verificationStatus !== "pending") {
    throw new Error("already_reviewed");
  }

  await deleteVerificationPhoto(profile.verificationPhotoPath || uid);

  const now = new Date().toISOString();
  await ref.update({
    verificationStatus: status,
    genderVerified: status === "approved",
    verificationPhotoPath: "",
    reviewedAt: now,
    reviewedBy: repUsername,
  });
}

export async function approveVerification(
  uid: string,
  repUsername: string
): Promise<void> {
  await finalizeReview(uid, "approved", repUsername);
  await sendVerificationApprovedPush(uid).catch(() => undefined);
}

export async function rejectVerification(
  uid: string,
  repUsername: string
): Promise<void> {
  await finalizeReview(uid, "rejected", repUsername);
}
