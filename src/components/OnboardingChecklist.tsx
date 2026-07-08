"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getFriendships } from "@/lib/friends/service";
import { isPlatformUnlocked } from "@/lib/auth-routing";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types/user";

const DISMISS_KEY = "tomris_onboarding_dismissed";

type StepId = "email" | "verification" | "friend" | "post";

interface StepState {
  id: StepId;
  done: boolean;
  locked?: boolean;
  href: string;
}

function dismissStorageKey(uid: string) {
  return `${DISMISS_KEY}_${uid}`;
}

async function checkHasFriend(uid: string): Promise<boolean> {
  const friendships = await getFriendships(uid);
  return friendships.some((f) => f.status === "accepted");
}

async function checkHasPost(uid: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "posts"), where("authorUid", "==", uid), limit(1))
  );
  return !snap.empty;
}

function buildSteps(
  user: User,
  profile: UserProfile,
  hasFriend: boolean,
  hasPost: boolean
): StepState[] {
  const unlocked = isPlatformUnlocked(profile);

  return [
    {
      id: "email",
      done: user.emailVerified,
      href: "/ayarlar",
    },
    {
      id: "verification",
      done: profile.verificationStatus === "approved",
      href: "/dogrulama",
    },
    {
      id: "friend",
      done: hasFriend,
      href: "/arkadaslar",
    },
    {
      id: "post",
      done: hasPost,
      locked: !unlocked,
      href: "/akis",
    },
  ];
}

export function OnboardingChecklist() {
  const { user, profile } = useAuth();
  const { t, ti } = useLanguage();
  const [hasFriend, setHasFriend] = useState(false);
  const [hasPost, setHasPost] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    setDismissed(localStorage.getItem(dismissStorageKey(user.uid)) === "1");
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    (async () => {
      setLoadingExtra(true);
      try {
        const [friendOk, postOk] = await Promise.all([
          checkHasFriend(user.uid),
          checkHasPost(user.uid),
        ]);
        if (!cancelled) {
          setHasFriend(friendOk);
          setHasPost(postOk);
        }
      } finally {
        if (!cancelled) setLoadingExtra(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, profile?.verificationStatus]);

  const steps = useMemo(() => {
    if (!user || !profile) return [];
    return buildSteps(user, profile, hasFriend, hasPost);
  }, [user, profile, hasFriend, hasPost]);

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = steps.length > 0 && doneCount === steps.length;

  if (!user || !profile || dismissed || loadingExtra) return null;
  if (allDone) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
        <p className="font-semibold text-emerald-900">{t.onboarding.completeTitle}</p>
        <p className="text-sm text-emerald-800">{t.onboarding.completeBody}</p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(dismissStorageKey(user.uid), "1");
            setDismissed(true);
          }}
          className="text-sm font-medium text-emerald-900 underline"
        >
          {t.onboarding.dismiss}
        </button>
      </div>
    );
  }

  const stepCopy = t.onboarding.steps;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-tomris text-lg">{t.onboarding.title}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{t.onboarding.subtitle}</p>
        <p className="text-xs text-[var(--muted)] mt-2">
          {ti(t.onboarding.progress, { done: String(doneCount), total: String(steps.length) })}
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => {
          const copy = stepCopy[step.id];
          const statusLabel = step.done
            ? t.onboarding.statusDone
            : step.locked
              ? t.onboarding.statusLocked
              : t.onboarding.statusPending;

          return (
            <li
              key={step.id}
              className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                step.done ? "border-emerald-200 bg-white/70" : "border-violet-100 bg-white/60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-sm flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      step.done ? "bg-emerald-500 text-white" : "bg-violet-200 text-violet-800"
                    }`}
                    aria-hidden
                  >
                    {step.done ? "✓" : "·"}
                  </span>
                  {copy.title}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1 pl-7">{copy.description}</p>
                <p className="text-xs text-[var(--muted)] pl-7">{statusLabel}</p>
              </div>
              {!step.done && !step.locked && (
                <Link
                  href={step.href}
                  className="shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg bg-tomris text-white hover:opacity-90 text-center"
                >
                  {copy.cta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => {
          localStorage.setItem(dismissStorageKey(user.uid), "1");
          setDismissed(true);
        }}
        className="text-xs text-[var(--muted)] underline"
      >
        {t.onboarding.dismiss}
      </button>
    </div>
  );
}
