/** Firestore'da saklanan fotoğraf referansı — yalnızca uid (dosya: data/verifications/{uid}.jpg) */
export function getVerificationPhotoId(uid: string): string {
  return uid;
}
