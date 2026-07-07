/**
 * Eski users belgelerindeki email alanını kaldırır (KVKK — e-posta yalnızca Firebase Auth'ta).
 * Çalıştır: node scripts/strip-public-emails.mjs
 * Gerekli: FIREBASE_SERVICE_ACCOUNT_JSON (.env.local yüklü veya env)
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!json) {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON eksik.");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(json)) });
}

const db = getFirestore();
const snap = await db.collection("users").get();
let updated = 0;

for (const doc of snap.docs) {
  if ("email" in doc.data()) {
    await doc.ref.update({ email: FieldValue.delete() });
    updated++;
  }
}

console.log(`Tamam: ${updated}/${snap.size} belgeden email alanı silindi.`);
