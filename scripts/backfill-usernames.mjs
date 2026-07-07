/**
 * Mevcut users belgelerinden usernames/{username} indeksini oluşturur.
 * Run: npm run backfill:usernames
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON gerekli");
  return JSON.parse(json);
}

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadServiceAccount()) });
  }
  const db = getFirestore();
  const snap = await db.collection("users").get();
  let created = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const username = (data.username as string | undefined)?.trim().toLowerCase();
    if (!username || username.length < 3) {
      skipped++;
      continue;
    }

    const ref = db.collection("usernames").doc(username);
    const existing = await ref.get();
    if (existing.exists && existing.data()?.uid !== docSnap.id) {
      console.warn(`Çakışma: @${username} — ${docSnap.id} atlandı`);
      skipped++;
      continue;
    }
    if (existing.exists) {
      skipped++;
      continue;
    }

    await ref.set({ uid: docSnap.id, username });
    created++;
  }

  console.log(`Tamam: ${created} indeks oluşturuldu, ${skipped} atlandı.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
