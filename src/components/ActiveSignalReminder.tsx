"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { isPlatformUnlocked } from "@/lib/auth-routing";
import { subscribeToOutgoingActiveSignals } from "@/lib/signals/client";
import type { EmergencySignal } from "@/types/signal";

export function ActiveSignalReminder() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [signals, setSignals] = useState<EmergencySignal[]>([]);

  useEffect(() => {
    if (!user || !profile || !isPlatformUnlocked(profile)) {
      setSignals([]);
      return;
    }
    return subscribeToOutgoingActiveSignals(user.uid, setSignals);
  }, [user, profile]);

  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
      <p className="font-medium text-amber-900 text-sm">{t.signal.activeReminderTitle}</p>
      <p className="text-sm text-amber-900/90 leading-relaxed">{t.signal.activeReminderBody}</p>
      <a
        href="tel:112"
        className="inline-flex items-center text-sm font-semibold text-amber-900 underline"
      >
        📞 {t.signal.emergencyCall}
      </a>
    </div>
  );
}
