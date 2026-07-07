"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { needsProfileCompletion, isPlatformUnlocked } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { MessageThread } from "@/components/chat/MessageThread";
import { ReportButton } from "@/components/ReportButton";
import { fetchConversation } from "@/lib/chat/service";
import { conversationTitle } from "@/lib/chat/helpers";
import { formatPostLocation } from "@/lib/locations";
import type { Conversation } from "@/types/chat";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user, profile, loading } = useAuth();
  const { t, locale } = useLanguage();
  useRedirectUnverifiedEmail();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const unlocked = isPlatformUnlocked(profile);

  const loadConversation = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const data = await fetchConversation(conversationId);
      if (!data) {
        setError(t.chat.errorLoad);
        return;
      }
      setConversation(data);
    } catch {
      setError(t.chat.errorLoad);
    } finally {
      setFetching(false);
    }
  }, [conversationId, t.chat.errorLoad]);

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && needsProfileCompletion(profile)) {
      router.replace("/kayit-tamamla");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (conversationId) loadConversation();
  }, [conversationId, loadConversation]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isMember = conversation ? conversation.participantUids.includes(user.uid) : false;
  const otherParticipantUid =
    conversation?.type === "dm"
      ? conversation.participantUids.find((id) => id !== user.uid)
      : undefined;

  if (!fetching && conversation && !isMember) {
    return (
      <AppShell onLogout={handleLogout}>
        <div className="space-y-4">
          <Link href="/mesajlar" className="text-sm link-tomris">
            {t.chat.backToInbox}
          </Link>
          <div className="card">
            <h1 className="font-semibold text-tomris">{conversation.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-2">{t.chat.joinGroup}</p>
            <Link href="/mesajlar?tab=groups" className="btn-primary inline-block mt-4 text-center">
              {t.chat.tabGroups}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-4">
        <Link href="/mesajlar" className="text-sm link-tomris inline-block">
          {t.chat.backToInbox}
        </Link>

        {fetching ? (
          <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
        ) : error || !conversation ? (
          <div className="alert-error">{error || t.chat.errorLoad}</div>
        ) : (
          <div className="card space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-tomris">
                  {conversationTitle(conversation, user.uid)}
                </h1>
                {conversation.type === "group" && (
                  <p className="text-xs text-[var(--muted)] mt-1">
                    📍 {formatPostLocation(conversation, locale)} ·{" "}
                    {conversation.participantUids.length} {t.chat.memberCount}
                    {conversation.adminUid === user.uid && (
                      <span className="ml-2 px-2 py-0.5 rounded-lg bg-primary-light">
                        {t.chat.adminBadge}
                      </span>
                    )}
                  </p>
                )}
                <p className="text-xs text-[var(--muted)] mt-2">{t.chat.pageSizeHint}</p>
              </div>
              {unlocked && isMember && (
                <ReportButton
                  reporterUid={user.uid}
                  reporterUsername={profile.username}
                  targetType="conversation"
                  targetId={conversation.id}
                  targetAuthorUid={otherParticipantUid}
                  className="text-sm px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-red-600 shrink-0"
                />
              )}
            </header>

            <MessageThread
              conversation={conversation}
              profile={profile}
              canSend={unlocked && isMember}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
