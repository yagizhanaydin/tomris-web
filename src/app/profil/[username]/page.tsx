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
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import { fetchPublicProfileViaApi } from "@/lib/users/client-api";
import { getOrCreateDm } from "@/lib/chat/service";
import { sendFriendRequest } from "@/lib/friends/service";
import type { PublicUserProfile } from "@/types/friendship";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const { user, profile, loading } = useAuth();
  const { t, ti } = useLanguage();
  useRedirectUnverifiedEmail();

  const [publicProfile, setPublicProfile] = useState<PublicUserProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    const normalized = normalizeUsername(rawUsername);
    if (!validateUsername(normalized)) {
      setNotFound(true);
      setPublicProfile(null);
      setFetching(false);
      return;
    }

    setFetching(true);
    setNotFound(false);
    try {
      const data = await fetchPublicProfileViaApi(normalized);
      if (!data) {
        setNotFound(true);
        setPublicProfile(null);
      } else {
        setPublicProfile(data);
      }
    } catch {
      setNotFound(true);
      setPublicProfile(null);
    } finally {
      setFetching(false);
    }
  }, [rawUsername]);

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
    if (user && profile) loadProfile();
  }, [user, profile, loadProfile]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  const handleAddFriend = async () => {
    if (!user || !profile || !publicProfile || publicProfile.uid === user.uid) return;
    setActionBusy(true);
    setMessage("");
    try {
      const result = await sendFriendRequest(user.uid, profile.username, {
        uid: publicProfile.uid,
        username: publicProfile.username,
      });
      if (result.ok) setMessage(t.friends.requestSent);
    } finally {
      setActionBusy(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !profile || !publicProfile || publicProfile.uid === user.uid) return;
    setActionBusy(true);
    try {
      const result = await getOrCreateDm(user.uid, profile.username, publicProfile.uid);
      if (result.ok) router.push(`/mesajlar/${result.conversationId}`);
    } finally {
      setActionBusy(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isSelf = publicProfile?.uid === user.uid;
  const tenureText =
    publicProfile &&
    (publicProfile.memberSinceDays <= 1
      ? t.profile.memberSinceOne
      : ti(t.profile.memberSince, { days: String(publicProfile.memberSinceDays) }));

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6 max-w-lg mx-auto">
        <Link href="/arkadaslar" className="text-sm link-tomris inline-block">
          ← {t.friends.title}
        </Link>

        {fetching ? (
          <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
        ) : notFound || !publicProfile ? (
          <div className="card">
            <p className="text-sm text-[var(--muted)]">{t.profile.notFound}</p>
          </div>
        ) : (
          <div className="card space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-tomris">@{publicProfile.username}</h1>
              {tenureText && (
                <p className="text-sm text-[var(--muted)] mt-2">{tenureText}</p>
              )}
            </div>

            {message && <div className="alert-success text-sm">{message}</div>}

            {!isSelf && isPlatformUnlocked(profile) && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddFriend}
                  disabled={actionBusy}
                  className="btn-primary text-sm py-2 px-4"
                >
                  {actionBusy ? t.common.loading : t.profile.addFriend}
                </button>
                <button
                  type="button"
                  onClick={handleMessage}
                  disabled={actionBusy}
                  className="text-sm py-2 px-4 rounded-xl border border-[var(--border)] hover:bg-primary-light/30"
                >
                  {actionBusy ? t.common.loading : t.profile.message}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
