import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import type { GroupJoinMode, GroupJoinRequest, PublicGroupListing } from "@/types/chat";

type GroupDoc = FirebaseFirestore.DocumentData;

function joinRequestsRef(conversationId: string) {
  return getAdminDb()
    .collection("conversations")
    .doc(conversationId)
    .collection("join_requests");
}

async function getGroupDoc(conversationId: string): Promise<{ ref: FirebaseFirestore.DocumentReference; data: GroupDoc }> {
  const ref = getAdminDb().collection("conversations").doc(conversationId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("not_found");
  const data = snap.data()!;
  if (data.type !== "group") throw new Error("not_group");
  return { ref, data };
}

function isLeader(data: GroupDoc, uid: string): boolean {
  return String(data.adminUid ?? "") === uid;
}

function joinModeOf(data: GroupDoc): GroupJoinMode {
  return data.joinMode === "open" ? "open" : "approval";
}

export async function listPublicGroups(
  max = 50,
  viewerUid?: string
): Promise<PublicGroupListing[]> {
  const snap = await getAdminDb()
    .collection("conversations")
    .where("type", "==", "group")
    .orderBy("updatedAt", "desc")
    .limit(max)
    .get();

  const groups = snap.docs.map((d) => {
    const data = d.data();
    const participantUids = (data.participantUids as string[]) ?? [];
    return {
      id: d.id,
      title: String(data.title ?? ""),
      region: data.region,
      country: data.country,
      city: data.city,
      district: data.district,
      updatedAt: String(data.updatedAt ?? ""),
      memberCount: participantUids.length,
      isMember: viewerUid ? participantUids.includes(viewerUid) : false,
      joinPending: false,
      joinMode: joinModeOf(data),
    };
  });

  if (!viewerUid) return groups;

  const pendingFlags = await Promise.all(
    groups.map(async (g) => {
      if (g.isMember) return false;
      const req = await joinRequestsRef(g.id).doc(viewerUid).get();
      return req.exists;
    })
  );

  return groups.map((g, i) => ({ ...g, joinPending: pendingFlags[i] }));
}

export async function joinGroupAsUser(
  conversationId: string,
  uid: string,
  username: string
): Promise<void> {
  const { ref, data } = await getGroupDoc(conversationId);

  const participantUids = (data.participantUids as string[]) ?? [];
  if (participantUids.includes(uid)) return;

  const participantUsernames = {
    ...((data.participantUsernames as Record<string, string>) ?? {}),
    [uid]: username,
  };

  await ref.update({
    participantUids: FieldValue.arrayUnion(uid),
    participantUsernames,
    updatedAt: new Date().toISOString(),
  });

  await joinRequestsRef(conversationId).doc(uid).delete().catch(() => undefined);
}

export async function requestJoinGroup(
  conversationId: string,
  uid: string,
  username: string
): Promise<"joined" | "pending"> {
  const { data } = await getGroupDoc(conversationId);

  const participantUids = (data.participantUids as string[]) ?? [];
  if (participantUids.includes(uid)) return "joined";

  if (joinModeOf(data) === "open") {
    await joinGroupAsUser(conversationId, uid, username);
    return "joined";
  }

  const existing = await joinRequestsRef(conversationId).doc(uid).get();
  if (existing.exists) return "pending";

  await joinRequestsRef(conversationId).doc(uid).set({
    uid,
    username,
    requestedAt: new Date().toISOString(),
  });

  return "pending";
}

export async function listJoinRequests(
  conversationId: string,
  leaderUid: string
): Promise<GroupJoinRequest[]> {
  const { data } = await getGroupDoc(conversationId);
  if (!isLeader(data, leaderUid)) throw new Error("not_leader");

  const snap = await joinRequestsRef(conversationId).orderBy("requestedAt", "asc").get();
  return snap.docs.map((d) => {
    const row = d.data();
    return {
      uid: d.id,
      username: String(row.username ?? ""),
      requestedAt: String(row.requestedAt ?? ""),
    };
  });
}

export async function approveJoinRequest(
  conversationId: string,
  leaderUid: string,
  targetUid: string
): Promise<void> {
  const { data } = await getGroupDoc(conversationId);
  if (!isLeader(data, leaderUid)) throw new Error("not_leader");

  const reqSnap = await joinRequestsRef(conversationId).doc(targetUid).get();
  if (!reqSnap.exists) throw new Error("no_request");

  const username = String(reqSnap.data()?.username ?? "");
  await joinGroupAsUser(conversationId, targetUid, username);
}

export async function rejectJoinRequest(
  conversationId: string,
  leaderUid: string,
  targetUid: string
): Promise<void> {
  const { data } = await getGroupDoc(conversationId);
  if (!isLeader(data, leaderUid)) throw new Error("not_leader");

  await joinRequestsRef(conversationId).doc(targetUid).delete();
}

export async function kickGroupMember(
  conversationId: string,
  leaderUid: string,
  targetUid: string
): Promise<void> {
  const { ref, data } = await getGroupDoc(conversationId);
  if (!isLeader(data, leaderUid)) throw new Error("not_leader");
  if (targetUid === leaderUid) throw new Error("cannot_kick_self");

  const participantUids = (data.participantUids as string[]) ?? [];
  if (!participantUids.includes(targetUid)) return;

  const participantUsernames = { ...((data.participantUsernames as Record<string, string>) ?? {}) };
  delete participantUsernames[targetUid];

  await ref.update({
    participantUids: participantUids.filter((id) => id !== targetUid),
    participantUsernames,
    updatedAt: new Date().toISOString(),
  });

  await joinRequestsRef(conversationId).doc(targetUid).delete().catch(() => undefined);
}

export async function leaveGroupAsUser(conversationId: string, uid: string): Promise<void> {
  const { ref, data } = await getGroupDoc(conversationId);

  const participantUids = (data.participantUids as string[]) ?? [];
  if (!participantUids.includes(uid)) return;

  const participantUsernames = { ...((data.participantUsernames as Record<string, string>) ?? {}) };
  delete participantUsernames[uid];
  const remaining = participantUids.filter((id) => id !== uid);

  if (remaining.length === 0) {
    await ref.delete();
    return;
  }

  const updates: Record<string, unknown> = {
    participantUids: remaining,
    participantUsernames,
    updatedAt: new Date().toISOString(),
  };

  if (isLeader(data, uid)) {
    updates.adminUid = remaining[0];
  }

  await ref.update(updates);
  await joinRequestsRef(conversationId).doc(uid).delete().catch(() => undefined);
}
