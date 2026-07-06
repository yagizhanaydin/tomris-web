/** İki kullanıcı için deterministik DM kimliği */
export function buildDmId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

export function getOtherParticipant(
  conversation: { participantUids: string[]; participantUsernames: Record<string, string> },
  currentUid: string
): { uid: string; username: string } | null {
  const otherUid = conversation.participantUids.find((id) => id !== currentUid);
  if (!otherUid) return null;
  return {
    uid: otherUid,
    username: conversation.participantUsernames[otherUid] ?? otherUid,
  };
}

export function conversationTitle(
  conversation: {
    type: string;
    title?: string;
    participantUids: string[];
    participantUsernames: Record<string, string>;
  },
  currentUid: string
): string {
  if (conversation.type === "group" && conversation.title) {
    return conversation.title;
  }
  const other = getOtherParticipant(conversation, currentUid);
  return other ? `@${other.username}` : "Sohbet";
}
