"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AuthLayout } from "@/components/AuthLayout";
import { useLanguage } from "@/context/LanguageProvider";
import { validateEmail } from "@/lib/security/validate";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateEmail(email)) {
      setError(t.auth.forgot.errorInvalidEmail);
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setSuccess(true);
    } catch {
      setError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t.auth.forgot.title} subtitle={t.auth.forgot.subtitle}>
      {success ? (
        <div className="space-y-4 text-center">
          <div className="alert-success">
            <strong className="text-tomris">{email}</strong> {t.auth.forgot.success}
          </div>
          <Link href="/giris" className="btn-primary inline-block text-center">
            {t.auth.forgot.backToLogin}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert-error">{error}</div>}

          <p className="text-sm text-[var(--muted)]">{t.auth.forgot.description}</p>

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
              maxLength={254}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t.auth.forgot.submitting : t.auth.forgot.submit}
          </button>

          <p className="text-center text-sm text-[var(--muted)]">
            <Link href="/giris" className="link-tomris">
              {t.auth.forgot.backToLogin}
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
