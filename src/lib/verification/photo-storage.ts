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

export type VerificationPhotoBackend = "local" | "firebase";

/** Sunucu diski (local/VPS) veya Firebase Storage (Vercel/serverless). */
export function getVerificationPhotoBackend(): VerificationPhotoBackend {
  const explicit = process.env.VERIFICATION_PHOTO_STORAGE?.toLowerCase();
  if (explicit === "firebase" || explicit === "local") {
    return explicit;
  }
  if (process.env.VERCEL === "1") {
    return "firebase";
  }
  return "local";
}

function normalizeUid(uidOrPath: string): string {
  return uidOrPath.replace(/^verifications\/pending\//, "").replace(/\.jpg$/, "");
}

export async function saveVerificationPhoto(uid: string, data: Buffer): Promise<void> {
  if (getVerificationPhotoBackend() === "firebase") {
    await saveFirebasePhoto(uid, data);
    return;
  }
  await saveLocalPhoto(uid, data);
}

export async function readVerificationPhoto(uidOrPath: string): Promise<Buffer | null> {
  const uid = normalizeUid(uidOrPath);
  if (getVerificationPhotoBackend() === "firebase") {
    return readFirebasePhoto(uid);
  }
  return readLocalPhoto(uid);
}

export async function deleteVerificationPhoto(uidOrPath: string): Promise<void> {
  const uid = normalizeUid(uidOrPath);
  if (getVerificationPhotoBackend() === "firebase") {
    await deleteFirebasePhoto(uid);
    return;
  }
  await deleteLocalPhoto(uid);
}
