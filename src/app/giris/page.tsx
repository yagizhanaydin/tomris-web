"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { getPostAuthRedirect, needsEmailVerification } from "@/lib/auth-routing";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && needsEmailVerification(user, profile)) {
      router.replace("/eposta-dogrula");
      return;
    }
    if (user && profile) {
      router.replace(getPostAuthRedirect(user, profile));
    }
    if (user && !profile) router.replace("/kayit-tamamla");
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      if (!credential.user.emailVerified) {
        router.replace("/eposta-dogrula");
        return;
      }
    } catch {
      setError(t.auth.login.errorInvalid);
    } finally {
      setSubmitting(false);
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
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            required
            showLabel={t.common.showPassword}
            hideLabel={t.common.hidePassword}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t.auth.login.submitting : t.auth.login.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t.auth.login.noAccount}{" "}
        <Link href="/kayit" className="link-tomris">
          {t.auth.login.register}
        </Link>
      </p>
    </AuthLayout>
  );
}
