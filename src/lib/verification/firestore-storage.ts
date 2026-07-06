import { getAdminDb } from "@/lib/firebase-admin";

const COLLECTION = "verification_photos";
/** Firestore belge limiti 1MB — güvenlik payı */
export const FIRESTORE_PHOTO_MAX_BYTES = 900_000;

export async function saveFirestorePhoto(uid: string, data: Buffer): Promise<void> {
  if (data.length > FIRESTORE_PHOTO_MAX_BYTES) {
    throw new Error(
      `Doğrulama fotoğrafı çok büyük (${Math.round(data.length / 1024)}KB). Lütfen tekrar çekin.`
    );
  }

  await getAdminDb().collection(COLLECTION).doc(uid).set({
    image: data,
    contentType: "image/jpeg",
    createdAt: new Date().toISOString(),
  });
}

export async function readFirestorePhoto(uid: string): Promise<Buffer | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;

  const image = snap.data()?.image;
  if (!image) return null;
  if (Buffer.isBuffer(image)) return image;
  if (image instanceof Uint8Array) return Buffer.from(image);
  return null;
}

export async function deleteFirestorePhoto(uid: string): Promise<void> {
  try {
    await getAdminDb().collection(COLLECTION).doc(uid).delete();
  } catch {
    // Belge zaten silinmiş olabilir
  }
}
