import { getAdminDb } from "@/lib/firebase-admin";
import type { EmergencySignal, SignalLocation } from "@/types/signal";

export async function createEmergencySignal(input: {
  uid: string;
  username: string;
  message?: string;
  location?: SignalLocation | null;
  notifyUids: string[];
}): Promise<string> {
  const ref = getAdminDb().collection("signals").doc();
  const now = new Date().toISOString();
  await ref.set({
    uid: input.uid,
    username: input.username,
    message: input.message?.trim() || null,
    location: input.location ?? null,
    notifyUids: input.notifyUids,
    status: "active",
    createdAt: now,
  });
  return ref.id;
}

export async function listActiveSignalsForUid(uid: string): Promise<EmergencySignal[]> {
  const snap = await getAdminDb()
    .collection("signals")
    .where("notifyUids", "array-contains", uid)
    .where("status", "==", "active")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencySignal));
}
