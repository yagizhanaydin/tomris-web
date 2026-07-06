"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { needsProfileCompletion, isPlatformUnlocked } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { VerificationStatusBanner } from "@/components/VerificationStatusBanner";
import { VerificationGate } from "@/components/VerificationGate";
import { GroupFiltersBar, GroupLocationFields, defaultGroupLocation } from "@/components/chat/GroupLocationFields";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import {
  fetchPublicGroups,
  filterGroups,
  startDmByUsername,
  createGroup,
  joinGroup,
  isGroupMember,
  subscribeToMyConversations,
} from "@/lib/chat/service";
import { conversationTitle } from "@/lib/chat/helpers";
import { formatPostLocation } from "@/lib/locations";
import { DEFAULT_GROUP_FILTERS } from "@/types/chat";
import type { Conversation } from "@/types/chat";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

type Tab = "inbox" | "groups" | "newDm";

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const { t, locale } = useLanguage();
  useRedirectUnverifiedEmail();

  const [tab, setTab] = useState<Tab>("inbox");
  const [inbox, setInbox] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Conversation[]>([]);
  const [groupFilters, setGroupFilters] = useState(DEFAULT_GROUP_FILTERS);
  const [fetching, setFetching] = useState(true);
  const [inboxError, setInboxError] = useState("");
  const [groupsError, setGroupsError] = useState("");
  const [dmUsername, setDmUsername] = useState("");
  const [dmError, setDmError] = useState("");
  const [dmSubmitting, setDmSubmitting] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupLocation, setGroupLocation] = useState(defaultGroupLocation());
  const [groupMessage, setGroupMessage] = useState("");
  const [groupError, setGroupError] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [joiningId, setJoiningId] = useState("");

  const unlocked = isPlatformUnlocked(profile);

  const loadGroups = useCallback(async () => {
    setGroupsError("");
    try {
      const allGroups = await fetchPublicGroups();
      setGroups(allGroups);
    } catch {
      setGroupsError(t.chat.errorLoad);
    } finally {
      setFetching(false);
    }
  }, [t.chat.errorLoad]);

  useEffect(() => {
    if (!user) return;

    setFetching(true);
    setInboxError("");
    const unsub = subscribeToMyConversations(
      user.uid,
      (convs) => {
        setInbox(convs);
        setFetching(false);
      },
      () => {
        setInboxError(t.chat.errorLoad);
        setFetching(false);
      }
    );

    loadGroups();

    return unsub;
  }, [user, loadGroups, t.chat.errorLoad]);

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && needsProfileCompletion(profile)) {
      router.replace("/kayit-tamamla");
    }
    if (!loading && profile?.verificationStatus === "rejected") {
      router.replace("/dogrulama-reddedildi");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    const dm = searchParams.get("dm");
    if (dm && profile && user && unlocked) {
      setTab("newDm");
      setDmUsername(dm);
    }
  }, [searchParams, profile, user, unlocked, loading, router]);

  const filteredGroups = useMemo(
    () => filterGroups(groups, groupFilters),
    [groups, groupFilters]
  );

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  const dmErrorMessage = (reason: string) => {
    if (reason === "userNotFound") return t.friends.userNotFound;
    if (reason === "blocked") return t.chat.dmBlocked;
    if (reason === "friendsOnly") return t.chat.dmFriendsOnly;
    if (reason === "cannotMessageSelf") return t.chat.dmSelf;
    return t.chat.errorSend;
  };

  const handleStartDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !unlocked) return;
    setDmError("");
    const normalized = normalizeUsername(dmUsername);
    if (!validateUsername(normalized)) {
      setDmError(t.friends.invalidUsername);
      return;
    }
    setDmSubmitting(true);
    try {
      const result = await startDmByUsername(user.uid, profile.username, normalized);
      if (!result.ok) {
        setDmError(dmErrorMessage(result.reason));
        return;
      }
      router.push(`/mesajlar/${result.conversationId}`);
    } catch {
      setDmError(t.chat.errorSend);
    } finally {
      setDmSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !unlocked) return;
    setGroupError("");
    setGroupMessage("");
    setGroupSubmitting(true);
    try {
      const id = await createGroup(user.uid, profile.username, groupTitle, groupLocation);
      setGroupMessage(t.chat.groupCreated);
      setGroupTitle("");
      setGroupLocation(defaultGroupLocation());
      await loadGroups();
      router.push(`/mesajlar/${id}`);
    } catch {
      setGroupError(t.chat.errorSend);
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user || !profile || !unlocked) return;
    setJoiningId(groupId);
    try {
      await joinGroup(groupId, user.uid, profile.username);
      setGroupMessage(t.chat.joinedGroup);
      await loadGroups();
      router.push(`/mesajlar/${groupId}`);
    } catch {
      setGroupError(t.chat.errorSend);
    } finally {
      setJoiningId("");
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "inbox", label: t.chat.tabInbox },
    { id: "groups", label: t.chat.tabGroups },
    { id: "newDm", label: t.chat.tabNewDm },
  ];

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-tomris">{t.chat.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{t.chat.subtitle}</p>
          </div>
          <Link href="/ayarlar" className="text-sm link-tomris shrink-0">
            {t.nav.settings} →
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                tab === item.id
                  ? "bg-primary text-white font-medium"
                  : "text-tomris hover:bg-primary-light border border-[var(--border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!unlocked && <VerificationStatusBanner />}

        {(inboxError || groupsError) && (
          <div className="alert-error text-sm">{inboxError || groupsError}</div>
        )}

        {groupMessage && <div className="alert-success text-sm">{groupMessage}</div>}

        {tab === "inbox" && (
          <div className="card space-y-3">
            {fetching ? (
              <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
            ) : inbox.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t.chat.emptyInbox}</p>
            ) : (
              inbox.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/mesajlar/${conv.id}`}
                  className="block p-4 rounded-xl border border-[var(--border)] hover:bg-primary-light/30 transition-colors"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-tomris">
                      {conversationTitle(conv, user.uid)}
                      {conv.type === "group" && conv.adminUid === user.uid && (
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-lg bg-primary-light">
                          {t.chat.adminBadge}
                        </span>
                      )}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-[var(--muted)] shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString(
                          locale === "en" ? "en-GB" : "tr-TR"
                        )}
                      </span>
                    )}
                  </div>
                  {conv.type === "group" && (
                    <p className="text-xs text-[var(--muted)] mt-1">
                      📍 {formatPostLocation(conv, locale)} · {conv.participantUids.length}{" "}
                      {t.chat.memberCount}
                    </p>
                  )}
                  {conv.lastMessageText && (
                    <p className="text-sm text-[var(--muted)] mt-1 truncate">{conv.lastMessageText}</p>
                  )}
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "groups" && (
          <div className="space-y-4">
            <GroupFiltersBar filters={groupFilters} onChange={setGroupFilters} />

            {unlocked ? (
              <form onSubmit={handleCreateGroup} className="card space-y-4">
                <h2 className="font-semibold text-tomris">{t.chat.createGroup}</h2>
                <label className="block">
                  <span className="text-xs text-tomris font-medium mb-1 block">{t.chat.groupTitle}</span>
                  <input
                    type="text"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder={t.chat.groupTitlePlaceholder}
                    maxLength={80}
                    required
                    className="input-field text-sm"
                  />
                </label>
                <GroupLocationFields
                  location={groupLocation}
                  onChange={setGroupLocation}
                  disabled={groupSubmitting}
                />
                <button type="submit" disabled={groupSubmitting} className="btn-primary sm:w-auto sm:px-8">
                  {groupSubmitting ? t.common.loading : t.chat.createGroupBtn}
                </button>
              </form>
            ) : (
              <VerificationGate>
                <div className="card">
                  <p className="text-sm text-[var(--muted)]">{t.chat.gateHint}</p>
                </div>
              </VerificationGate>
            )}

            <div className="card space-y-3">
              {fetching ? (
                <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
              ) : filteredGroups.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {groups.length === 0 ? t.chat.emptyGroups : t.chat.emptyFilteredGroups}
                </p>
              ) : (
                filteredGroups.map((group) => {
                  const member = isGroupMember(group, user.uid);
                  return (
                    <div
                      key={group.id}
                      className="p-4 rounded-xl border border-[var(--border)] space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-tomris">{group.title}</p>
                          <p className="text-xs text-[var(--muted)] mt-1">
                            📍 {formatPostLocation(group, locale)} · {group.participantUids.length}{" "}
                            {t.chat.memberCount}
                          </p>
                        </div>
                        {member ? (
                          <Link
                            href={`/mesajlar/${group.id}`}
                            className="btn-primary text-sm py-2 px-4 sm:w-auto text-center"
                          >
                            {t.chat.tabInbox}
                          </Link>
                        ) : unlocked ? (
                          <button
                            type="button"
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={joiningId === group.id}
                            className="btn-primary text-sm py-2 px-4 sm:w-auto"
                          >
                            {joiningId === group.id ? t.common.loading : t.chat.joinGroup}
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">{t.chat.gateHint}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === "newDm" && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-tomris">{t.chat.newDm}</h2>
            {unlocked ? (
              <>
                {dmError && <div className="alert-error text-sm">{dmError}</div>}
                <form onSubmit={handleStartDm} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={dmUsername}
                    onChange={(e) => setDmUsername(e.target.value)}
                    placeholder={t.chat.newDmPlaceholder}
                    maxLength={20}
                    autoComplete="off"
                    className="input-field flex-1"
                  />
                  <button type="submit" disabled={dmSubmitting} className="btn-primary sm:w-auto sm:px-8">
                    {dmSubmitting ? t.common.loading : t.chat.startDm}
                  </button>
                </form>
              </>
            ) : (
              <VerificationGate>
                <form className="flex flex-col sm:flex-row gap-3">
                  <input type="text" disabled className="input-field flex-1" />
                  <button type="button" disabled className="btn-primary sm:w-auto sm:px-8">
                    {t.chat.startDm}
                  </button>
                </form>
              </VerificationGate>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center tomris-gradient">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
