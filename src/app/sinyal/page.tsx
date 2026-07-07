"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { isPlatformUnlocked, needsProfileCompletion } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { VerificationGate } from "@/components/VerificationGate";
import { getCurrentPosition } from "@/lib/geolocation";
import { IncomingSignalsBanner } from "@/components/IncomingSignalsBanner";
import { SignalIntroAck } from "@/components/SignalIntroAck";
import { SignalSendConsentModal } from "@/components/SignalSendConsentModal";
import { ActiveSignalReminder } from "@/components/ActiveSignalReminder";
import { SIGNAL_SAFETY_ACK_VERSION } from "@/lib/signals/safety";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function SignalPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  useRedirectUnverifiedEmail();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"" | "loading" | "attached" | "denied">("");
  const [consentOpen, setConsentOpen] = useState(false);

  const introAcked = profile?.signalSafetyIntroVersion === SIGNAL_SAFETY_ACK_VERSION;

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

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  const handleSend = async () => {
    if (!user || !profile || submitting || !introAcked) return;
    setError("");
    setSuccess(false);
    setLocationStatus("");
    setSubmitting(true);
    setLocationStatus("loading");
    let sentLocationStatus: "attached" | "denied" = "denied";
    try {
      const location = await getCurrentPosition();
      sentLocationStatus = location ? "attached" : "denied";

      const token = await user.getIdToken();
      const res = await fetch("/api/signals/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          location,
          safetyAcknowledged: true,
          safetyAckVersion: SIGNAL_SAFETY_ACK_VERSION,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }
      setSuccess(true);
      setLocationStatus(sentLocationStatus);
      setMessage("");
      setConsentOpen(false);
    } catch {
      setError(t.common.error);
      setLocationStatus("");
    } finally {
      setSubmitting(false);
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

  const form = (
    <div className="space-y-4">
      <SignalIntroAck />
      <ActiveSignalReminder />
      <p className="text-sm text-[var(--muted)] leading-relaxed">{t.signal.intro}</p>
      <p className="text-xs text-tomris/80 bg-primary-light/40 border border-[var(--border)] rounded-xl p-3">
        {t.signal.note}
      </p>
      <p className="text-xs text-[var(--muted)]">{t.signal.pushSoon}</p>
      <p className="text-xs text-tomris/80">{t.signal.shareLocationHint}</p>

      {locationStatus === "loading" && (
        <p className="text-xs text-[var(--muted)]">{t.signal.locationLoading}</p>
      )}
      {success && locationStatus === "attached" && (
        <p className="text-xs text-green-700">{t.signal.locationAttached}</p>
      )}
      {success && locationStatus === "denied" && (
        <p className="text-xs text-[var(--muted)]">{t.signal.locationDenied}</p>
      )}

      {success && <div className="alert-success">{t.signal.success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-tomris">{t.signal.messageLabel}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.signal.messagePlaceholder}
          maxLength={280}
          rows={3}
          disabled={submitting || !introAcked}
          className="input-field text-sm resize-none"
        />
      </label>

      <button
        type="button"
        onClick={() => setConsentOpen(true)}
        disabled={submitting || !introAcked}
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
      >
        {t.signal.send}
      </button>

      <Link href="/arkadaslar" className="block text-center text-sm link-tomris">
        {t.nav.friends} →
      </Link>

      <SignalSendConsentModal
        open={consentOpen}
        onClose={() => !submitting && setConsentOpen(false)}
        onConfirm={handleSend}
        submitting={submitting}
      />
    </div>
  );

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-tomris">{t.signal.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t.signal.subtitle}</p>
        </div>

        <div className="card">
          <IncomingSignalsBanner />
          {unlocked ? (
            form
          ) : (
            <VerificationGate>
              <p className="text-sm text-[var(--muted)] mb-4">{t.signal.gateHint}</p>
              {form}
            </VerificationGate>
          )}
        </div>
      </div>
    </AppShell>
  );
}
