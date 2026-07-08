import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import { hashRepPassword, verifyRepPassword } from "@/lib/reps/password";

export interface RepRecord {
  username: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface RepPublic {
  username: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

function repRef(username: string) {
  return getAdminDb().collection("reps").doc(normalizeUsername(username));
}

export async function listReps(): Promise<RepPublic[]> {
  const snap = await getAdminDb().collection("reps").get();
  return snap.docs
    .map((d) => {
      const data = d.data() as RepRecord;
      return {
        username: data.username,
        active: data.active !== false,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRep(
  username: string,
  password: string,
  createdBy: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeUsername(username);
  if (!validateUsername(normalized)) {
    return { ok: false, error: "Geçersiz kullanıcı adı." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Şifre en az 8 karakter olmalı." };
  }

  const ref = repRef(normalized);
  const existing = await ref.get();
  if (existing.exists) {
    return { ok: false, error: "Bu temsilci kullanıcı adı zaten var." };
  }

  const record: RepRecord = {
    username: normalized,
    passwordHash: await hashRepPassword(password),
    active: true,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  await ref.set(record);
  return { ok: true };
}

export async function deactivateRep(username: string): Promise<boolean> {
  const ref = repRef(username);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.update({ active: false });
  return true;
}

export async function verifyRepCredentials(
  username: string,
  password: string
): Promise<string | null> {
  const normalized = normalizeUsername(username);
  const snap = await repRef(normalized).get();
  if (!snap.exists) return null;

  const data = snap.data() as RepRecord;
  if (data.active === false) return null;

  const valid = await verifyRepPassword(password, data.passwordHash);
  return valid ? data.username : null;
}
