"use client";

import { useEffect, useState } from "react";
import { subscribeFriendships } from "@/lib/friends/subscribe";
import { getIncomingRequests } from "@/lib/friends/service";
import { subscribeToMyConversations } from "@/lib/chat/service";

export interface NavBadges {
  friends: number;
  messages: number;
}

const EMPTY: NavBadges = { friends: 0, messages: 0 };

/** Uygulama içi rozetler — push bildirim öncesi */
export function useNavBadges(uid: string | undefined): NavBadges {
  const [badges, setBadges] = useState<NavBadges>(EMPTY);

  useEffect(() => {
    if (!uid) {
      setBadges(EMPTY);
      return;
    }

    let friendCount = 0;
    let messageCount = 0;

    const sync = () => {
      setBadges({ friends: friendCount, messages: messageCount });
    };

    const unsubFriends = subscribeFriendships(uid, (list) => {
      friendCount = getIncomingRequests(list, uid).length;
      sync();
    });

    const unsubInbox = subscribeToMyConversations(uid, (conversations) => {
      messageCount = conversations.filter(
        (c) =>
          c.lastMessageAt &&
          c.lastMessageAuthorUid &&
          c.lastMessageAuthorUid !== uid
      ).length;
      sync();
    });

    return () => {
      unsubFriends();
      unsubInbox();
    };
  }, [uid]);

  return badges;
}
