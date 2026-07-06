export type Gender = "kadin" | "erkek";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  gender: Gender;
  verificationPhotoUrl: string;
  genderVerified: boolean;
  createdAt: string;
  authProvider: "email" | "google";
}
