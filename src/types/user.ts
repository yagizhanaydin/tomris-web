export type Gender = "kadin" | "erkek";
export type VerificationStatus = "unverified" | "pending" | "approved" | "rejected" | "banned";
/** Bireysel sohbet: yalnızca arkadaşlar veya herkes */
export type ChatVisibility = "friends" | "everyone";

export interface UserProfile {
  uid: string;
  username: string;
  /** Yalnızca Firebase Auth — Firestore'a yazılmaz (KVKK) */
  email?: string;
  gender: Gender;
  /** Sunucudaki geçici dosya referansı (uid) — onay/red sonrası silinir */
  verificationPhotoPath: string;
  verificationStatus: VerificationStatus;
  genderVerified: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  authProvider: "email" | "google";
  /** Varsayılan: friends */
  chatVisibility?: ChatVisibility;
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
}
