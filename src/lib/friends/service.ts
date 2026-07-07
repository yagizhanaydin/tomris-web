import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  or,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import { lookupUidByUsername } from "@/lib/users/usernames";
import { lookupUserViaApi, searchUsersViaApi } from "@/lib/users/client-api";
import type { Friendship, FriendProfile } from "@/types/friendship";

function db() {
  return getFirebaseDb();
}

export function blockDocId(blockerUid: string, blockedUid: string): string {
  return `${blockerUid}_${blockedUid}`;
}

export async function findUserByUsername(
  username: string
): Promise<FriendProfile | null> {
  const normalized = normalizeUsername(username);
  if (!validateUsername(normalized)) return null;

  try {
    return await lookupUserViaApi(normalized);
  } catch {
    const indexed = await lookupUidByUsername(normalized);
    if (!indexed) return null;

    const userSnap = await getDoc(doc(db(), "users", indexed.uid));
    if (!userSnap.exists() || userSnap.data().verificationStatus !== "approved") return null;
    if (userSnap.data().verificationStatus === "banned") return null;

    return indexed;
  }
}

/** Kullanıcı adı öneki ile arama — onaylı kullanıcılar (server API) */
export async function searchUsersByUsernamePrefix(
  rawQuery: string,
  options?: { excludeUid?: string; limit?: number }
): Promise<FriendProfile[]> {
  const normalized = normalizeUsername(rawQuery);
  if (normalized.length < 2) return [];

  try {
    return await searchUsersViaApi(normalized, options);
  } catch {
    return [];
  }
}

export async function isBlocked(
  uidA: string,
  uidB: string
): Promise<boolean> {
  const col = collection(db(), "blocks");

  const [snapA, snapB] = await Promise.all([
    getDocs(
      query(
        col,
        where("blockerUid", "==", uidA),
        where("blockedUid", "==", uidB),
        limit(1)
      )
    ),
    getDocs(
      query(
        col,
        where("blockerUid", "==", uidB),
        where("blockedUid", "==", uidA),
        limit(1)
      )
    ),
  ]);

  return !snapA.empty || !snapB.empty;
}

export async function getBlockedAuthorUids(blockerUid: string): Promise<Set<string>> {
  const q = query(
    collection(db(), "blocks"),
    where("blockerUid", "==", blockerUid)
  );
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => d.data().blockedUid as string));
}

export async function getFriendships(uid: string): Promise<Friendship[]> {
  const q = query(
    collection(db(), "friendships"),
    or(where("fromUid", "==", uid), where("toUid", "==", uid))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Friendship));
}

export async function sendFriendRequest(
  fromUid: string,
  fromUsername: string,
  toUser: FriendProfile
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (fromUid === toUser.uid) {
    return { ok: false, reason: "cannotAddSelf" };
  }

  if (await isBlocked(fromUid, toUser.uid)) {
    return { ok: false, reason: "blockedUser" };
  }

  const existing = await getFriendships(fromUid);
  const duplicate = existing.find(
    (f) =>
      (f.fromUid === toUser.uid || f.toUid === toUser.uid) &&
      (f.status === "pending" || f.status === "accepted")
  );

  if (duplicate?.status === "accepted") {
    return { ok: false, reason: "alreadyFriends" };
  }
  if (duplicate?.status === "pending") {
    return { ok: false, reason: "alreadyPending" };
  }

  const now = new Date().toISOString();
  await addDoc(collection(db(), "friendships"), {
    fromUid,
    toUid: toUser.uid,
    fromUsername: normalizeUsername(fromUsername),
    toUsername: toUser.username,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  return { ok: true };
}

export async function respondToRequest(
  friendshipId: string,
  toUid: string,
  accept: boolean
): Promise<void> {
  const ref = doc(db(), "friendships", friendshipId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("not_found");

  const data = snap.data() as Friendship;
  if (data.toUid !== toUid || data.status !== "pending") {
    throw new Error("forbidden");
  }

  await updateDoc(ref, {
    status: accept ? "accepted" : "rejected",
    updatedAt: new Date().toISOString(),
  });
}

export async function removeFriendship(
  friendshipId: string,
  uid: string
): Promise<void> {
  const ref = doc(db(), "friendships", friendshipId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Friendship;
  if (data.fromUid !== uid && data.toUid !== uid) {
    throw new Error("forbidden");
  }

  await deleteDoc(ref);
}

export async function blockUser(
  blockerUid: string,
  blockedUid: string,
  blockedUsername: string
): Promise<void> {
  if (blockerUid === blockedUid) return;

  const friendships = await getFriendships(blockerUid);
  const related = friendships.filter(
    (f) => f.fromUid === blockedUid || f.toUid === blockedUid
  );
  await Promise.all(related.map((f) => deleteDoc(doc(db(), "friendships", f.id))));

  const now = new Date().toISOString();
  await setDoc(doc(db(), "blocks", blockDocId(blockerUid, blockedUid)), {
    blockerUid,
    blockedUid,
    blockedUsername: normalizeUsername(blockedUsername),
    createdAt: now,
  });
}

export function getAcceptedFriends(
  friendships: Friendship[],
  currentUid: string
): FriendProfile[] {
  return friendships
    .filter((f) => f.status === "accepted")
    .map((f) => ({
      uid: f.fromUid === currentUid ? f.toUid : f.fromUid,
      username: f.fromUid === currentUid ? f.toUsername : f.fromUsername,
    }));
}

export function getIncomingRequests(
  friendships: Friendship[],
  currentUid: string
): Friendship[] {
  return friendships.filter(
    (f) => f.toUid === currentUid && f.status === "pending"
  );
}
