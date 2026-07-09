/**
 * Kapalı beta sıfırlama — tüm Auth kullanıcıları + kullanıcı verisi (Firestore).
 * Çalıştır: node scripts/wipe-beta-data.mjs --confirm
 * Gerekli: FIREBASE_SERVICE_ACCOUNT_JSON (.env.local)
 *
 * Korunan: reps (temsilci hesapları)
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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

if (!process.argv.includes("--confirm")) {
  console.error("Onay gerekli: node scripts/wipe-beta-data.mjs --confirm");
  process.exit(1);
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
const auth = getAuth();

async function deleteQueryBatch(query, batchSize = 100) {
  let total = 0;
  while (true) {
    const snap = await query.limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
    if (snap.size < batchSize) break;
  }
  return total;
}

async function wipeCollection(name) {
  const n = await deleteQueryBatch(db.collection(name));
  console.log(`  ${name}: ${n} belge silindi`);
  return n;
}

async function wipeConversations() {
  const snap = await db.collection("conversations").get();
  let messages = 0;
  let joinRequests = 0;

  for (const doc of snap.docs) {
    messages += await deleteQueryBatch(doc.ref.collection("messages"));
    joinRequests += await deleteQueryBatch(doc.ref.collection("join_requests"));
    await doc.ref.delete();
  }

  console.log(`  conversations: ${snap.size} sohbet`);
  console.log(`    messages: ${messages}`);
  console.log(`    join_requests: ${joinRequests}`);
  return snap.size;
}

async function wipeAuthUsers() {
  let total = 0;
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    for (const user of result.users) {
      await auth.deleteUser(user.uid);
      total++;
    }
    pageToken = result.pageToken;
  } while (pageToken);

  console.log(`  Firebase Auth: ${total} kullanıcı silindi`);
  return total;
}

console.log("Tomris beta verisi siliniyor...\n");

const authCount = await wipeAuthUsers();

console.log("");
await wipeCollection("users");
await wipeCollection("usernames");
await wipeCollection("verification_photos");
await wipeCollection("friendships");
await wipeCollection("blocks");
await wipeCollection("posts");
await wipeCollection("comments");
await wipeConversations();
await wipeCollection("signals");
await wipeCollection("fcm_tokens");
await wipeCollection("reports");
await wipeCollection("platform_bans");

console.log("\nTamam. reps koleksiyonu korundu.");
console.log(`Auth: ${authCount} hesap silindi — kayıt testine sıfırdan devam edebilirsin.`);
