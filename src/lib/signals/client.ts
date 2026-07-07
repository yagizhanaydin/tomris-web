import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { EmergencySignal } from "@/types/signal";

export function subscribeToIncomingSignals(
  uid: string,
  onUpdate: (signals: EmergencySignal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), "signals"),
    where("notifyUids", "array-contains", uid),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencySignal))
      );
    },
    (err) => onError?.(err)
  );
}
