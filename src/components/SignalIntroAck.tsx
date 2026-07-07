"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { SIGNAL_SAFETY_ACK_VERSION } from "@/lib/signals/safety";

export function SignalIntroAck() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const needsAck =
    profile &&
    profile.signalSafetyIntroVersion !== SIGNAL_SAFETY_ACK_VERSION;

  if (!needsAck) return null;

  const handleAck = async () => {
    if (!user || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/signals/ack-intro", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version: SIGNAL_SAFETY_ACK_VERSION }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }
      await refreshProfile();
    } catch {
      setError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-primary-light/30 p-4 space-y-3">
      <p className="font-medium text-tomris text-sm">{t.signal.introAckTitle}</p>
      <p className="text-sm text-[var(--muted)] leading-relaxed">{t.signal.introAckBody}</p>
      <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc pl-5">
        {t.signal.introAckPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleAck}
        disabled={submitting}
        className="btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {submitting ? t.signal.introAckSubmitting : t.signal.introAckButton}
      </button>
    </div>
  );
}
