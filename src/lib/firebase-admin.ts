import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function normalizePrivateKey(serviceAccount: Record<string, unknown>): Record<string, unknown> {
  const key = serviceAccount.private_key;
  if (typeof key === "string") {
    serviceAccount.private_key = key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
  }
  return serviceAccount;
}

function parseServiceAccountJson(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // Vercel'de bazen çift tırnak veya kaçış bozulur — tek satır JSON dene
    const unwrapped =
      trimmed.startsWith('"') && trimmed.endsWith('"')
        ? (JSON.parse(trimmed) as string)
        : trimmed;
    parsed = JSON.parse(unwrapped) as Record<string, unknown>;
  }
  return normalizePrivateKey(parsed);
}

export function getAdminConfigError(): string | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json?.trim()) {
    return "FIREBASE_SERVICE_ACCOUNT_JSON eksik.";
  }
  try {
    parseServiceAccountJson(json);
    getAdminApp();
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Firebase Admin başlatılamadı.";
  }
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON eksik. Firebase Console > Service Accounts > private key indir."
    );
  }

  const serviceAccount = parseServiceAccountJson(json);
  adminApp = initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
  });

  return adminApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function isAdminConfigured(): boolean {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json?.trim()) return false;
  try {
    parseServiceAccountJson(json);
    return true;
  } catch {
    return false;
  }
}
