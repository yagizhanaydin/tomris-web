import {
  saveLocalPhoto,
  readLocalPhoto,
  deleteLocalPhoto,
} from "./local-storage";
import {
  saveFirebasePhoto,
  readFirebasePhoto,
  deleteFirebasePhoto,
} from "./firebase-storage";
import {
  saveFirestorePhoto,
  readFirestorePhoto,
  deleteFirestorePhoto,
} from "./firestore-storage";

export type VerificationPhotoBackend = "local" | "firestore" | "firebase";

/** local = disk (dev/VPS) | firestore = Spark ücretsiz (Vercel) | firebase = Storage (Blaze) */
export function getVerificationPhotoBackend(): VerificationPhotoBackend {
  const explicit = process.env.VERIFICATION_PHOTO_STORAGE?.toLowerCase();
  if (explicit === "firebase") return "firebase";
  // Vercel serverless: disk yazılamaz — env local olsa bile firestore kullan
  if (process.env.VERCEL === "1") return "firestore";
  if (explicit === "firestore" || explicit === "local") return explicit;
  return "local";
}

function normalizeUid(uidOrPath: string): string {
  return uidOrPath.replace(/^verifications\/pending\//, "").replace(/\.jpg$/, "");
}

export async function saveVerificationPhoto(uid: string, data: Buffer): Promise<void> {
  const backend = getVerificationPhotoBackend();
  if (backend === "firebase") {
    await saveFirebasePhoto(uid, data);
    return;
  }
  if (backend === "firestore") {
    await saveFirestorePhoto(uid, data);
    return;
  }
  await saveLocalPhoto(uid, data);
}

export async function readVerificationPhoto(uidOrPath: string): Promise<Buffer | null> {
  const uid = normalizeUid(uidOrPath);
  const backend = getVerificationPhotoBackend();
  if (backend === "firebase") {
    return readFirebasePhoto(uid);
  }
  if (backend === "firestore") {
    return readFirestorePhoto(uid);
  }
  return readLocalPhoto(uid);
}

export async function deleteVerificationPhoto(uidOrPath: string): Promise<void> {
  const uid = normalizeUid(uidOrPath);
  const backend = getVerificationPhotoBackend();
  if (backend === "firebase") {
    await deleteFirebasePhoto(uid);
    return;
  }
  if (backend === "firestore") {
    await deleteFirestorePhoto(uid);
    return;
  }
  await deleteLocalPhoto(uid);
}
