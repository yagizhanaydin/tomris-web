import type { UserProfile } from "@/types/user";

/** Google kaydı: kullanıcı adı ve cinsiyet eksik mi? */
export function needsProfileCompletion(profile: UserProfile | null): boolean {
  if (!profile) return true;
  return !profile.username || !profile.gender;
}

/** Fotoğraf doğrulaması henüz yapılmamış veya reddedilmiş mi? */
export function needsVerificationPhoto(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.verificationStatus === "unverified" ||
    profile.verificationStatus === "rejected"
  );
}

/** Fotoğraf gönderildi, temsilci onayı bekleniyor mu? */
export function isVerificationPending(profile: UserProfile | null): boolean {
  return profile?.verificationStatus === "pending";
}

/** Arkadaşlık, yorum vb. platform özellikleri açık mı? */
export function isPlatformUnlocked(profile: UserProfile | null): boolean {
  return profile?.verificationStatus === "approved";
}

/** Giriş sonrası yönlendirme hedefi */
export function getPostAuthRedirect(profile: UserProfile | null): string {
  if (!profile || needsProfileCompletion(profile)) return "/kayit-tamamla";

  switch (profile.verificationStatus) {
    case "banned":
      return "/hesap-yasaklandi";
    case "rejected":
      return "/dogrulama-reddedildi";
    default:
      return "/dashboard";
  }
}

export function isAccountBanned(profile: UserProfile | null): boolean {
  return profile?.verificationStatus === "banned";
}
