import {
  collection,
  onSnapshot,
  or,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Friendship } from "@/types/friendship";

function mapFriendship(id: string, data: Record<string, unknown>): Friendship {
  return {
    id,
    fromUid: data.fromUid as string,
    toUid: data.toUid as string,
    fromUsername: data.fromUsername as string,
    toUsername: data.toUsername as string,
    status: data.status as Friendship["status"],
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

export function subscribeFriendships(
  uid: string,
  onUpdate: (friendships: Friendship[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), "friendships"),
    or(where("fromUid", "==", uid), where("toUid", "==", uid))
  );

  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => mapFriendship(d.id, d.data())));
    },
    (err) => onError?.(err as Error)
  );
}
