import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";

export class UsernameTakenError extends Error {
  constructor() {
    super("USERNAME_TAKEN");
    this.name = "UsernameTakenError";
  }
}

/** Kayıt sırasında kullanıcı adını rezerve et — çakışmada hata */
export async function reserveUsername(uid: string, username: string): Promise<string> {
  const normalized = normalizeUsername(username);
  if (!validateUsername(normalized)) {
    throw new Error("INVALID_USERNAME");
  }

  const ref = doc(getFirebaseDb(), "usernames", normalized);
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data()?.uid !== uid) {
    throw new UsernameTakenError();
  }
  if (existing.exists()) return normalized;

  try {
    await setDoc(ref, { uid, username: normalized });
  } catch {
    throw new UsernameTakenError();
  }

  return normalized;
}

/** Kullanıcı adından uid çöz — usernames indeksinden */
export async function lookupUidByUsername(
  username: string
): Promise<{ uid: string; username: string } | null> {
  const normalized = normalizeUsername(username);
  if (!validateUsername(normalized)) return null;

  const snap = await getDoc(doc(getFirebaseDb(), "usernames", normalized));
  if (!snap.exists()) return null;

  const data = snap.data();
  return { uid: data.uid as string, username: data.username as string };
}
