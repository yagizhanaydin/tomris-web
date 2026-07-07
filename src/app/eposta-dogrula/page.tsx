"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { sendTomrisEmailVerification } from "@/lib/auth/email-verification";
import { getFirebaseAuth } from "@/lib/firebase";
import { getPostAuthRedirect, needsEmailVerification } from "@/lib/auth-routing";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [resending, setResending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/giris");
      return;
    }
    if (!needsEmailVerification(user, profile)) {
      router.replace(getPostAuthRedirect(user, profile));
    }
  }, [user, profile, loading, router]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setError("");
    setMessage("");
    try {
      await sendTomrisEmailVerification(user);
      setMessage(t.auth.verifyEmail.resent);
    } catch {
      setError(t.common.error);
    } finally {
      setResending(false);
    }
  };

  const handleConfirm = async () => {
    if (!user) return;
    setConfirming(true);
    setError("");
    setMessage("");
    try {
      await user.reload();
      const refreshed = getFirebaseAuth().currentUser;
      if (refreshed?.emailVerified) {
        router.replace(getPostAuthRedirect(refreshed, profile));
        return;
      }
      setError(t.auth.verifyEmail.stillUnverified);
    } catch {
      setError(t.common.error);
    } finally {
      setConfirming(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.replace("/giris");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout title={t.auth.verifyEmail.title} subtitle={t.auth.verifyEmail.subtitle}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-light flex items-center justify-center">
          <svg className="w-8 h-8 text-tomris" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="text-sm text-[var(--muted)] text-center leading-relaxed">
          {t.auth.verifyEmail.sentTo}
          <br />
          <strong className="text-tomris">{user.email}</strong>
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 text-center leading-relaxed">
          {t.auth.verifyEmail.checkSpam}
        </div>

        {message && <div className="alert-success text-sm text-center">{message}</div>}
        {error && <div className="alert-error text-sm">{error}</div>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirming}
          className="btn-primary w-full"
        >
          {confirming ? t.auth.verifyEmail.confirming : t.auth.verifyEmail.confirm}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full py-2 text-sm link-tomris underline disabled:opacity-50"
        >
          {resending ? t.auth.verifyEmail.resending : t.auth.verifyEmail.resend}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full text-sm text-[var(--muted)] hover:text-tomris"
        >
          {t.auth.verifyEmail.backToLogin}
        </button>
      </div>
    </AuthLayout>
  );
}
