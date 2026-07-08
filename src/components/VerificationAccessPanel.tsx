"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageProvider";

export type QueueInfo = {
  position: number;
  total: number;
};

export function useVerificationQueue(enabled: boolean) {
  const [queue, setQueue] = useState<QueueInfo | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setQueue(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const user = getFirebaseAuth().currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("/api/verification/queue", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setQueue(data.queue ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return { queue, loading };
}

interface VerificationAccessPanelProps {
  variant: "pending" | "unverified" | "submitted";
  showQueue?: boolean;
}

export function VerificationAccessPanel({
  variant,
  showQueue = variant === "pending" || variant === "submitted",
}: VerificationAccessPanelProps) {
  const { t, ti } = useLanguage();
  const { queue, loading } = useVerificationQueue(showQueue);

  const intro =
    variant === "pending" || variant === "submitted"
      ? t.verification.accessPendingIntro
      : t.verification.accessUnverifiedIntro;

  return (
    <div className="rounded-xl border border-violet-100 bg-white/70 p-4 space-y-4 text-sm">
      <div className="space-y-1">
        <p className="font-semibold text-tomris">{t.verification.accessTitle}</p>
        <p className="text-[var(--muted)] leading-relaxed">{intro}</p>
      </div>

      {(variant === "pending" || variant === "submitted") && showQueue && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          {loading && !queue ? (
            <p className="text-amber-900 text-xs">{t.verification.queueLoading}</p>
          ) : queue ? (
            <p className="text-amber-900 font-medium">
              {ti(t.verification.queuePosition, {
                position: String(queue.position),
                total: String(queue.total),
              })}
            </p>
          ) : null}
          <p className="text-xs text-amber-800/80 mt-1">{t.verification.queueHint}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="font-medium text-emerald-800 mb-2">{t.verification.accessCanTitle}</p>
          <ul className="space-y-1.5 text-[var(--foreground)]">
            {t.verification.accessCanList.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-600 shrink-0" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-rose-800 mb-2">{t.verification.accessCannotTitle}</p>
          <ul className="space-y-1.5 text-[var(--foreground)]">
            {t.verification.accessCannotList.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-rose-500 shrink-0" aria-hidden>
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
