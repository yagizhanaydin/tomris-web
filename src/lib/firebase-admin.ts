import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function parseServiceAccountJson(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // Vercel'de bazen çift tırnak veya kaçış bozulur — tek satır JSON dene
    const unwrapped =
      trimmed.startsWith('"') && trimmed.endsWith('"')
        ? JSON.parse(trimmed) as string
        : trimmed;
    return JSON.parse(unwrapped) as Record<string, unknown>;
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
