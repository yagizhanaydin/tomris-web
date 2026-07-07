import { doc, getDoc, runTransaction } from "firebase/firestore";
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

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snap = await transaction.get(ref);
    if (snap.exists() && snap.data()?.uid !== uid) {
      throw new UsernameTakenError();
    }
    if (!snap.exists()) {
      transaction.set(ref, { uid, username: normalized });
    }
  });

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
