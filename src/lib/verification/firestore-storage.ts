import { getAdminDb } from "@/lib/firebase-admin";

const COLLECTION = "verification_photos";
/** Firestore belge limiti 1MB — base64 ~%33 overhead + alan adları */
export const FIRESTORE_PHOTO_MAX_BYTES = 480_000;

export async function saveFirestorePhoto(uid: string, data: Buffer): Promise<void> {
  if (data.length > FIRESTORE_PHOTO_MAX_BYTES) {
    throw new Error(
      `Doğrulama fotoğrafı çok büyük (${Math.round(data.length / 1024)}KB). Lütfen tekrar çekin.`
    );
  }

  const imageBase64 = data.toString("base64");
  if (imageBase64.length > 900_000) {
    throw new Error(
      `Firestore belge boyutu aşıldı (${Math.round(imageBase64.length / 1024)}KB base64). Tekrar çekin.`
    );
  }

  try {
    await getAdminDb()
      .collection(COLLECTION)
      .doc(uid)
      .set({
        imageBase64,
        contentType: "image/jpeg",
        createdAt: new Date().toISOString(),
      });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Firestore yazılamadı";
    throw new Error(`verification_photos kaydedilemedi: ${detail}`);
  }
}

export async function readFirestorePhoto(uid: string): Promise<Buffer | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;

  const data = snap.data();
  if (!data) return null;

  if (typeof data.imageBase64 === "string" && data.imageBase64.length > 0) {
    return Buffer.from(data.imageBase64, "base64");
  }

  const image = data.image;
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
