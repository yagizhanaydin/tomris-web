import { getAuth } from "firebase-admin/auth";
import { getAdminApp, isAdminConfigured } from "@/lib/firebase-admin";

export async function verifyFirebaseIdToken(
  authHeader: string | null
): Promise<{ uid: string } | null> {
  if (!isAdminConfigured()) return null;

  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
