import { getFriendships, isBlocked } from "@/lib/friends/service";
import { getChatVisibility } from "@/lib/users/settings";
import type { UserProfile } from "@/types/user";

export type DmAccessReason =
  | "cannotMessageSelf"
  | "blocked"
  | "friendsOnly"
  | "banned";

export async function canInitiateDm(
  fromUid: string,
  toProfile: UserProfile
): Promise<{ ok: true } | { ok: false; reason: DmAccessReason }> {
  if (fromUid === toProfile.uid) {
    return { ok: false, reason: "cannotMessageSelf" };
  }
  if (toProfile.verificationStatus === "banned") {
    return { ok: false, reason: "banned" };
  }
  if (await isBlocked(fromUid, toProfile.uid)) {
    return { ok: false, reason: "blocked" };
  }

  const visibility = getChatVisibility(toProfile);
  if (visibility === "everyone") {
    return { ok: true };
  }

  const friendships = await getFriendships(fromUid);
  const isFriend = friendships.some(
    (f) =>
      f.status === "accepted" &&
      (f.fromUid === toProfile.uid || f.toUid === toProfile.uid)
  );

  if (!isFriend) {
    return { ok: false, reason: "friendsOnly" };
  }

  return { ok: true };
}
