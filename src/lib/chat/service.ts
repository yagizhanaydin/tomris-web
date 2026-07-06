import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { sanitizeText } from "@/lib/security/validate";
import { TR_COUNTRY } from "@/lib/locations";
import { buildDmId } from "./helpers";
import { canInitiateDm } from "./visibility";
import { fetchUserProfile } from "@/lib/users/settings";
import { findUserByUsername } from "@/lib/friends/service";
import type { PostLocationInput } from "@/types/post";
import type { Conversation, ChatMessage, GroupFilters } from "@/types/chat";

export const MESSAGE_PAGE_SIZE = 20;

function db() {
  return getFirebaseDb();
}

export async function fetchMyConversations(uid: string): Promise<Conversation[]> {
  const q = query(
    collection(db(), "conversations"),
    where("participantUids", "array-contains", uid),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export async function fetchConversation(
  conversationId: string
): Promise<Conversation | null> {
  const snap = await getDoc(doc(db(), "conversations", conversationId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Conversation;
}

export async function getOrCreateDm(
  fromUid: string,
  fromUsername: string,
  toUid: string
): Promise<{ ok: true; conversationId: string } | { ok: false; reason: string }> {
  const toProfile = await fetchUserProfile(toUid);
  if (!toProfile) return { ok: false, reason: "userNotFound" };

  const access = await canInitiateDm(fromUid, toProfile);
  if (!access.ok) return { ok: false, reason: access.reason };

  const conversationId = buildDmId(fromUid, toUid);
  const ref = doc(db(), "conversations", conversationId);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const uids = [fromUid, toUid].sort();
    await setDoc(ref, {
      type: "dm",
      participantUids: uids,
      participantUsernames: {
        [fromUid]: fromUsername,
        [toUid]: toProfile.username,
      },
      createdBy: fromUid,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { ok: true, conversationId };
}

export async function startDmByUsername(
  fromUid: string,
  fromUsername: string,
  username: string
): Promise<{ ok: true; conversationId: string } | { ok: false; reason: string }> {
  const target = await findUserByUsername(username);
  if (!target) return { ok: false, reason: "userNotFound" };
  return getOrCreateDm(fromUid, fromUsername, target.uid);
}

export async function createGroup(
  creatorUid: string,
  creatorUsername: string,
  title: string,
  location: PostLocationInput
): Promise<string> {
  const trimmedTitle = title.trim().slice(0, 80);
  if (!trimmedTitle) throw new Error("empty_title");
  if (!location.city) throw new Error("location_required");
  if (location.region === "tr" && !location.district) throw new Error("location_required");
  if (location.region === "eu" && !location.country) throw new Error("location_required");

  const now = new Date().toISOString();
  const ref = await addDoc(collection(db(), "conversations"), {
    type: "group",
    title: trimmedTitle,
    region: location.region,
    country: location.region === "tr" ? TR_COUNTRY : location.country,
    city: location.city,
    district: location.region === "tr" ? location.district : "",
    adminUid: creatorUid,
    participantUids: [creatorUid],
    participantUsernames: { [creatorUid]: creatorUsername },
    createdBy: creatorUid,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function fetchPublicGroups(max = 50): Promise<Conversation[]> {
  const q = query(
    collection(db(), "conversations"),
    where("type", "==", "group"),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export function filterGroups(
  groups: Conversation[],
  filters: GroupFilters
): Conversation[] {
  return groups.filter((g) => {
    if (filters.region && g.region !== filters.region) return false;
    if (filters.country && g.country !== filters.country) return false;
    if (filters.city && g.city !== filters.city) return false;
    if (filters.district && g.district !== filters.district) return false;
    return true;
  });
}

export async function joinGroup(
  conversationId: string,
  uid: string,
  username: string
): Promise<void> {
  const ref = doc(db(), "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("not_found");

  const data = snap.data() as Conversation;
  if (data.type !== "group") throw new Error("not_group");
  if (data.participantUids.includes(uid)) return;

  await updateDoc(ref, {
    participantUids: arrayUnion(uid),
    participantUsernames: {
      ...data.participantUsernames,
      [uid]: username,
    },
    updatedAt: new Date().toISOString(),
  });
}

export async function fetchMessagesPage(
  conversationId: string,
  pageSize = MESSAGE_PAGE_SIZE,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  messages: ChatMessage[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  let q = query(
    collection(db(), "conversations", conversationId, "messages"),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1)
  );

  if (cursor) {
    q = query(
      collection(db(), "conversations", conversationId, "messages"),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(pageSize + 1)
    );
  }

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const page = hasMore ? docs.slice(0, pageSize) : docs;

  const messages = page
    .map((d) => ({ id: d.id, ...d.data() } as ChatMessage))
    .reverse();

  const lastCursor = page.length > 0 ? page[page.length - 1] : null;

  return { messages, cursor: lastCursor, hasMore };
}

/** Eski mesajları yükle (canlı pencerenin öncesinden) */
export async function fetchOlderMessages(
  conversationId: string,
  beforeMessageId: string,
  pageSize = MESSAGE_PAGE_SIZE
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const beforeDoc = await getDoc(
    doc(db(), "conversations", conversationId, "messages", beforeMessageId)
  );
  if (!beforeDoc.exists()) {
    return { messages: [], hasMore: false };
  }

  const page = await fetchMessagesPage(conversationId, pageSize, beforeDoc);
  return { messages: page.messages, hasMore: page.hasMore };
}

/** Son N mesaj — Firestore onSnapshot ile canlı güncelleme */
export function subscribeToRecentMessages(
  conversationId: string,
  pageSize: number,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db(), "conversations", conversationId, "messages"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ChatMessage))
        .reverse();
      onUpdate(messages);
    },
    (err) => onError?.(err as Error)
  );
}

/** Gelen kutusu — yeni mesaj gelince liste anında güncellenir */
export function subscribeToMyConversations(
  uid: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db(), "conversations"),
    where("participantUids", "array-contains", uid),
    orderBy("updatedAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)));
    },
    (err) => onError?.(err as Error)
  );
}

export async function sendMessage(
  conversationId: string,
  authorUid: string,
  authorUsername: string,
  content: string
): Promise<void> {
  const convRef = doc(db(), "conversations", conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists()) throw new Error("not_found");

  const conv = convSnap.data() as Conversation;
  if (!conv.participantUids.includes(authorUid)) throw new Error("forbidden");

  const text = sanitizeText(content, 2000);
  if (!text) throw new Error("empty_content");

  const now = new Date().toISOString();
  await addDoc(collection(db(), "conversations", conversationId, "messages"), {
    authorUid,
    authorUsername,
    content: text,
    createdAt: now,
  });

  await updateDoc(convRef, {
    lastMessageText: text.length > 120 ? `${text.slice(0, 117)}...` : text,
    lastMessageAt: now,
    lastMessageAuthorUid: authorUid,
    updatedAt: now,
  });
}

export function isGroupMember(conversation: Conversation, uid: string): boolean {
  return conversation.participantUids.includes(uid);
}

export function isGroupAdmin(conversation: Conversation, uid: string): boolean {
  return conversation.type === "group" && conversation.adminUid === uid;
}
