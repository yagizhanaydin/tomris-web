"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { getPostAuthRedirect } from "@/lib/auth-routing";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(getPostAuthRedirect(profile));
    }
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      if (!credential.user.emailVerified) {
        setNeedsVerification(true);
        setError(t.auth.login.errorUnverified);
        setSubmitting(false);
        return;
      }
    } catch {
      setError(t.auth.login.errorInvalid);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert(t.auth.login.resendVerification);
      }
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        {needsVerification && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full py-2 text-sm link-tomris underline disabled:opacity-50"
          >
            {resending ? t.auth.login.resending : t.auth.login.resendVerification}
          </button>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-tomris">
            {t.auth.login.email}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="ornek@gmail.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-tomris">
              {t.auth.login.password}
            </label>
            <Link href="/sifremi-unuttum" className="text-xs link-tomris">
              {t.auth.login.forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t.auth.login.submitting : t.auth.login.submit}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-[var(--muted)]">{t.common.or}</span>
        </div>
      </div>

      <GoogleSignInButton label={t.auth.login.google} />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t.auth.login.noAccount}{" "}
        <Link href="/kayit" className="link-tomris">
          {t.auth.login.register}
        </Link>
      </p>
    </AuthLayout>
  );
}
