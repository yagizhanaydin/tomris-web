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
    if (!user || !profile || submitting) return;
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/signals/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }
      setSuccess(true);
      setMessage("");
    } catch {
      setError(t.common.error);
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
      <p className="text-sm text-[var(--muted)] leading-relaxed">{t.signal.intro}</p>
      <p className="text-xs text-tomris/80 bg-primary-light/40 border border-[var(--border)] rounded-xl p-3">
        {t.signal.note}
      </p>
      <p className="text-xs text-[var(--muted)]">{t.signal.pushSoon}</p>

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
          disabled={submitting}
          className="input-field text-sm resize-none"
        />
      </label>

      <button
        type="button"
        onClick={handleSend}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
      >
        {submitting ? t.signal.sending : t.signal.send}
      </button>

      <Link href="/arkadaslar" className="block text-center text-sm link-tomris">
        {t.nav.friends} →
      </Link>
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
