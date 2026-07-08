"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageProvider";
import type { Conversation } from "@/types/chat";
import {
  approveGroupJoinRequest,
  fetchGroupJoinRequests,
  kickGroupMember,
  leaveGroup,
  rejectGroupJoinRequest,
} from "@/lib/chat/service";
import type { GroupJoinRequest } from "@/types/chat";

type GroupLeaderPanelProps = {
  conversation: Conversation;
  currentUid: string;
  onConversationChange: () => void;
};

export function GroupLeaderPanel({
  conversation,
  currentUid,
  onConversationChange,
}: GroupLeaderPanelProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const isLeader = conversation.adminUid === currentUid;

  const [requests, setRequests] = useState<GroupJoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(isLeader);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [kickConfirmUid, setKickConfirmUid] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!isLeader) return;
    setLoadingRequests(true);
    try {
      const data = await fetchGroupJoinRequests(conversation.id);
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [conversation.id, isLeader]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (uid: string) => {
    setBusyUid(uid);
    try {
      await approveGroupJoinRequest(conversation.id, uid);
      await loadRequests();
      onConversationChange();
    } finally {
      setBusyUid(null);
    }
  };

  const handleReject = async (uid: string) => {
    setBusyUid(uid);
    try {
      await rejectGroupJoinRequest(conversation.id, uid);
      await loadRequests();
    } finally {
      setBusyUid(null);
    }
  };

  const handleKick = async (uid: string) => {
    setBusyUid(uid);
    try {
      await kickGroupMember(conversation.id, uid);
      setKickConfirmUid(null);
      onConversationChange();
    } finally {
      setBusyUid(null);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(t.chat.leaveGroupConfirm)) return;
    setLeaving(true);
    try {
      await leaveGroup(conversation.id);
      router.push("/mesajlar?tab=groups");
    } finally {
      setLeaving(false);
    }
  };

  const members = conversation.participantUids.map((uid) => ({
    uid,
    username: conversation.participantUsernames[uid] ?? uid.slice(0, 8),
    isLeader: conversation.adminUid === uid,
  }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-primary-light/10 p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-tomris">{t.chat.membersTitle}</h2>
        <ul className="mt-2 space-y-2">
          {members.map((member) => (
            <li
              key={member.uid}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profil/${member.username}`} className="link-tomris font-medium">
                  @{member.username}
                </Link>
                {member.isLeader && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-primary-light">
                    {t.chat.leaderBadge}
                  </span>
                )}
              </div>
              {isLeader && member.uid !== currentUid && (
                <div className="flex gap-2">
                  {kickConfirmUid === member.uid ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleKick(member.uid)}
                        disabled={busyUid === member.uid}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white"
                      >
                        {busyUid === member.uid ? t.common.loading : t.chat.kickConfirmYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setKickConfirmUid(null)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)]"
                      >
                        {t.common.cancel}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setKickConfirmUid(member.uid)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-red-600 hover:bg-red-50"
                    >
                      {t.chat.kickMember}
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isLeader && (
        <div>
          <h2 className="text-sm font-semibold text-tomris">{t.chat.joinRequestsTitle}</h2>
          {loadingRequests ? (
            <p className="text-sm text-[var(--muted)] mt-2">{t.common.loading}</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-[var(--muted)] mt-2">{t.chat.noJoinRequests}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {requests.map((req) => (
                <li
                  key={req.uid}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
                >
                  <Link href={`/profil/${req.username}`} className="text-sm link-tomris">
                    @{req.username}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.uid)}
                      disabled={busyUid === req.uid}
                      className="text-xs px-3 py-1.5 rounded-lg btn-primary"
                    >
                      {busyUid === req.uid ? t.common.loading : t.chat.approveJoin}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(req.uid)}
                      disabled={busyUid === req.uid}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)]"
                    >
                      {t.chat.rejectJoin}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleLeave}
        disabled={leaving}
        className="text-sm text-red-600 hover:underline"
      >
        {leaving ? t.common.loading : t.chat.leaveGroup}
      </button>
    </div>
  );
}
