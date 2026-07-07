"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { subscribeToIncomingSignals } from "@/lib/signals/client";
import { mapsUrl } from "@/lib/geolocation";
import { isPlatformUnlocked } from "@/lib/auth-routing";
import type { EmergencySignal } from "@/types/signal";

function formatTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function IncomingSignalsBanner() {
  const { user, profile } = useAuth();
  const { t, locale, ti } = useLanguage();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const [signals, setSignals] = useState<EmergencySignal[]>([]);

  useEffect(() => {
    if (!user || !profile || !isPlatformUnlocked(profile)) {
      setSignals([]);
      return;
    }

    return subscribeToIncomingSignals(user.uid, setSignals);
  }, [user, profile]);

  const handleResolve = async (signalId: string) => {
    if (!user || resolvingId) return;
    setResolvingId(signalId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/signals/${signalId}/resolve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("resolve_failed");
    } catch {
      // kullanıcı tekrar deneyebilir
    } finally {
      setResolvingId(null);
    }
  };

  if (signals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-red-700">{t.signal.incomingTitle}</h2>
      {signals.map((signal) => (
        <div
          key={signal.id}
          className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-2"
        >
          <p className="font-semibold text-red-800">
            {ti(t.signal.incomingFrom, { username: signal.username })}
          </p>
          <p className="text-xs text-red-700/80">{formatTime(signal.createdAt, locale)}</p>
          {signal.message && (
            <p className="text-sm text-red-900 whitespace-pre-wrap">{signal.message}</p>
          )}
          {signal.location ? (
            <a
              href={mapsUrl(signal.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-700 underline"
            >
              📍 {t.signal.openMap}
            </a>
          ) : (
            <p className="text-xs text-red-700/70">{t.signal.noLocation}</p>
          )}
          <button
            type="button"
            onClick={() => handleResolve(signal.id)}
            disabled={resolvingId === signal.id}
            className="text-sm font-medium text-red-800 underline disabled:opacity-50"
          >
            {resolvingId === signal.id ? t.signal.resolving : t.signal.markSeen}
          </button>
        </div>
      ))}
    </div>
  );
}
