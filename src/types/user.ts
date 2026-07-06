export type Gender = "kadin" | "erkek";
export type VerificationStatus = "unverified" | "pending" | "approved" | "rejected" | "banned";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  gender: Gender;
  /** Sunucudaki geçici dosya referansı (uid) — onay/red sonrası silinir */
  verificationPhotoPath: string;
  verificationStatus: VerificationStatus;
  genderVerified: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  authProvider: "email" | "google";
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
}
