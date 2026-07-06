"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { needsProfileCompletion, isPlatformUnlocked } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { VerificationGate } from "@/components/VerificationGate";
import { validateUsername, normalizeUsername } from "@/lib/security/validate";
import {
  findUserByUsername,
  getFriendships,
  sendFriendRequest,
  respondToRequest,
  removeFriendship,
  blockUser,
  getAcceptedFriends,
  getIncomingRequests,
} from "@/lib/friends/service";
import { getOrCreateDm } from "@/lib/chat/service";
import type { Friendship } from "@/types/friendship";

type FriendErrorKey =
  | "userNotFound"
  | "alreadyFriends"
  | "alreadyPending"
  | "cannotAddSelf"
  | "blockedUser"
  | "invalidUsername";

export default function FriendsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();

  const [username, setUsername] = useState("");
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<FriendErrorKey | "">("");
  const [messageLoading, setMessageLoading] = useState<string | null>(null);

  const loadFriendships = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const data = await getFriendships(user.uid);
      setFriendships(data);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && needsProfileCompletion(profile)) {
      router.replace("/kayit-tamamla");
    }
    if (!loading && profile?.verificationStatus === "pending") {
      router.replace("/dogrulama-bekliyor");
    }
    if (!loading && profile?.verificationStatus === "rejected") {
      router.replace("/dogrulama-reddedildi");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (user) loadFriendships();
  }, [user, loadFriendships]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !isPlatformUnlocked(profile)) return;

    setError("");
    setMessage("");
    const normalized = normalizeUsername(username);

    if (!validateUsername(normalized)) {
      setError("invalidUsername");
      return;
    }

    setSubmitting(true);
    try {
      const target = await findUserByUsername(normalized);
      if (!target) {
        setError("userNotFound");
        return;
      }

      const result = await sendFriendRequest(user.uid, profile.username, target);
      if (!result.ok) {
        setError(result.reason as FriendErrorKey);
        return;
      }

      setMessage(t.friends.requestSent);
      setUsername("");
      await loadFriendships();
    } catch {
      setError("");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (friendship: Friendship) => {
    if (!user) return;
    await respondToRequest(friendship.id, user.uid, true);
    setMessage(t.friends.requestAccepted);
    await loadFriendships();
  };

  const handleReject = async (friendship: Friendship) => {
    if (!user) return;
    await respondToRequest(friendship.id, user.uid, false);
    await loadFriendships();
  };

  const handleRemove = async (friendship: Friendship) => {
    if (!user) return;
    await removeFriendship(friendship.id, user.uid);
    await loadFriendships();
  };

  const handleBlock = async (friendUid: string, friendUsername: string) => {
    if (!user) return;
    await blockUser(user.uid, friendUid, friendUsername);
    setMessage(t.friends.blocked);
    await loadFriendships();
  };

  const handleMessage = async (friendUid: string) => {
    if (!user || !profile || !isPlatformUnlocked(profile)) return;
    setMessageLoading(friendUid);
    try {
      const result = await getOrCreateDm(user.uid, profile.username, friendUid);
      if (!result.ok) {
        setMessage("");
        return;
      }
      router.push(`/mesajlar/${result.conversationId}`);
    } finally {
      setMessageLoading(null);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const unlocked = isPlatformUnlocked(profile);

  const friends = getAcceptedFriends(friendships, user.uid);
  const incoming = getIncomingRequests(friendships, user.uid);

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-tomris">{t.friends.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t.friends.subtitle}</p>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-tomris">{t.friends.addFriend}</h2>

          {unlocked ? (
            <>
              {message && <div className="alert-success">{message}</div>}
              {error && <div className="alert-error">{t.friends[error]}</div>}

              <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.friends.usernamePlaceholder}
                  maxLength={20}
                  autoComplete="off"
                  className="input-field flex-1"
                />
                <button type="submit" disabled={submitting} className="btn-primary sm:w-auto sm:px-8">
                  {submitting ? t.friends.searching : t.friends.search}
                </button>
              </form>
            </>
          ) : (
            <VerificationGate>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  disabled
                  placeholder={t.friends.usernamePlaceholder}
                  className="input-field flex-1"
                />
                <button type="button" disabled className="btn-primary sm:w-auto sm:px-8">
                  {t.friends.search}
                </button>
              </form>
            </VerificationGate>
          )}
        </div>

        {unlocked ? (
          <>
            <div className="card space-y-3">
              <h2 className="font-semibold text-tomris">{t.friends.incoming}</h2>
              {fetching ? (
                <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
              ) : incoming.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t.friends.noRequests}</p>
              ) : (
                incoming.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-primary-light/20"
                  >
                    <span className="font-medium text-tomris">@{req.fromUsername}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
                      >
                        {t.friends.accept}
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)]"
                      >
                        {t.friends.reject}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card space-y-3">
              <h2 className="font-semibold text-tomris">{t.friends.myFriends}</h2>
              {fetching ? (
                <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
              ) : friends.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t.friends.noFriends}</p>
              ) : (
                friends.map((friend) => {
                  const friendship = friendships.find(
                    (f) =>
                      f.status === "accepted" &&
                      (f.fromUid === friend.uid || f.toUid === friend.uid)
                  );
                  return (
                    <div
                      key={friend.uid}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)]"
                    >
                      <span className="font-medium text-tomris">@{friend.username}</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleMessage(friend.uid)}
                          disabled={messageLoading === friend.uid}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark"
                        >
                          {messageLoading === friend.uid ? t.common.loading : t.friends.message}
                        </button>
                        {friendship && (
                          <button
                            onClick={() => handleRemove(friendship)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] hover:bg-primary-light"
                          >
                            {t.friends.remove}
                          </button>
                        )}
                        <button
                          onClick={() => handleBlock(friend.uid, friend.username)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50"
                        >
                          {t.friends.block}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <VerificationGate>
            <div className="card space-y-3">
              <h2 className="font-semibold text-tomris">{t.friends.myFriends}</h2>
              <p className="text-sm text-[var(--muted)]">{t.friends.noFriends}</p>
            </div>
          </VerificationGate>
        )}
      </div>
    </AppShell>
  );
}
