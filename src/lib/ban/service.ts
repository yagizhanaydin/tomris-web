import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getAdminDb } from "@/lib/firebase-admin";
import { deleteVerificationPhoto } from "@/lib/verification/photo-storage";
import type { UserProfile } from "@/types/user";
import type { PlatformBan } from "@/types/ban";

export type { PlatformBan };

function normalizeEmail(email: string): string {
  const trimmed = email.toLowerCase().trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  if (domain === "googlemail.com") domain = "gmail.com";

  if (domain === "gmail.com") {
    const plus = local.indexOf("+");
    if (plus >= 0) local = local.slice(0, plus);
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

async function resolveUserEmail(uid: string, profileEmail?: string): Promise<string> {
  try {
    const authUser = await getAuth(getAdminApp()).getUser(uid);
    if (authUser.email) return normalizeEmail(authUser.email);
  } catch {
    // Auth kaydı yoksa Firestore yedek (eski hesaplar)
  }
  return normalizeEmail(profileEmail ?? "");
}

export async function isEmailBanned(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const snap = await getAdminDb()
    .collection("platform_bans")
    .where("email", "==", normalized)
    .limit(1)
    .get();

  return !snap.empty;
}

export async function isUidBanned(uid: string): Promise<boolean> {
  const doc = await getAdminDb().collection("platform_bans").doc(uid).get();
  return doc.exists;
}

export async function listPlatformBans(limit = 50): Promise<PlatformBan[]> {
  const snap = await getAdminDb()
    .collection("platform_bans")
    .orderBy("bannedAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => d.data() as PlatformBan);
}

/** Troll / uygunsuz içerik — kalıcı yasak, fotoğraf anında silinir */
export async function banUser(
  uid: string,
  repUsername: string,
  reason: string
): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("user_not_found");

  const profile = snap.data() as UserProfile;

  await deleteVerificationPhoto(profile.verificationPhotoPath || uid);

  const email = await resolveUserEmail(uid, profile.email);
  const now = new Date().toISOString();
  const banRecord: PlatformBan = {
    uid,
    email,
    username: profile.username,
    reason,
    bannedAt: now,
    bannedBy: repUsername,
  };

  await ref.update({
    verificationStatus: "banned",
    genderVerified: false,
    verificationPhotoPath: "",
    bannedAt: now,
    bannedBy: repUsername,
    banReason: reason,
  });

  await db.collection("platform_bans").doc(uid).set(banRecord);

  try {
    await getAuth(getAdminApp()).updateUser(uid, { disabled: true });
  } catch {
    // Auth kaydı yoksa devam et
  }
}
