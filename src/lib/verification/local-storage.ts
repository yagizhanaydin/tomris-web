import fs from "fs/promises";
import path from "path";

const VERIFICATION_DIR = path.join(process.cwd(), "data", "verifications");

export function getLocalPhotoPath(uid: string): string {
  return path.join(VERIFICATION_DIR, `${uid}.jpg`);
}

export async function ensureVerificationDir(): Promise<void> {
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
}

export async function saveLocalPhoto(uid: string, data: Buffer): Promise<void> {
  await ensureVerificationDir();
  const filePath = getLocalPhotoPath(uid);
  await fs.writeFile(filePath, data);
}

export async function deleteLocalPhoto(uid: string): Promise<void> {
  try {
    await fs.unlink(getLocalPhotoPath(uid));
  } catch {
    // Dosya zaten silinmiş olabilir
  }
}

export async function readLocalPhoto(uid: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(getLocalPhotoPath(uid));
  } catch {
    return null;
  }
}

export async function photoExists(uid: string): Promise<boolean> {
  try {
    await fs.access(getLocalPhotoPath(uid));
    return true;
  } catch {
    return false;
  }
}
