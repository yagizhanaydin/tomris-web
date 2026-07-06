import { getStorage } from "firebase-admin/storage";
import { getAdminApp } from "@/lib/firebase-admin";

const OBJECT_PREFIX = "verifications/pending";

function objectPath(uid: string): string {
  return `${OBJECT_PREFIX}/${uid}.jpg`;
}

function getBucket() {
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET veya NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET tanımlı değil."
    );
  }
  return getStorage(getAdminApp()).bucket(bucketName);
}

export async function saveFirebasePhoto(uid: string, data: Buffer): Promise<void> {
  const file = getBucket().file(objectPath(uid));
  await file.save(data, {
    metadata: { contentType: "image/jpeg" },
    resumable: false,
  });
}

export async function readFirebasePhoto(uid: string): Promise<Buffer | null> {
  const file = getBucket().file(objectPath(uid));
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buffer] = await file.download();
  return buffer;
}

export async function deleteFirebasePhoto(uid: string): Promise<void> {
  try {
    await getBucket().file(objectPath(uid)).delete({ ignoreNotFound: true });
  } catch {
    // Dosya zaten silinmiş olabilir
  }
}
