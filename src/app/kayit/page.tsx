"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordField } from "@/components/PasswordField";
import { registerWithEmail } from "@/lib/auth-helpers";
import { useLanguage } from "@/context/LanguageProvider";

import type { Gender } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.auth.register.errorPasswordShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.register.errorPasswordMatch);
      return;
    }
    if (!gender) {
      setError(t.auth.register.errorGender);
      return;
    }
    if (!acceptedTerms) {
      setError(t.legal.registerAcceptRequired);
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(username, email, password, gender as Gender);
      router.replace("/eposta-dogrula");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.auth.register.errorRegister;
      if (message === "BANNED_EMAIL") {
        setError(t.ban.registerBlocked);
      } else if (message === "CONTENT_BLOCKED") {
        setError(t.common.contentBlocked);
      } else if (message === "INVALID_USERNAME") {
        setError(t.friends.invalidUsername);
      } else if (message === "USERNAME_TAKEN") {
        setError(t.friends.usernameTaken);
      } else if (message.includes("email-already-in-use")) {
        setError(t.auth.register.errorEmailInUse);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t.auth.register.title} subtitle={t.auth.register.subtitle}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1.5 text-tomris">
            {t.auth.register.username}
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder={t.auth.register.usernamePlaceholder}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-tomris">
            {t.auth.register.email}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder={t.auth.register.emailPlaceholder}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-tomris">
            {t.auth.register.password}
          </label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={t.auth.register.passwordPlaceholder}
            required
            showLabel={t.common.showPassword}
            hideLabel={t.common.hidePassword}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-tomris">
            {t.auth.register.confirmPassword}
          </label>
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={t.auth.register.confirmPlaceholder}
            required
            showLabel={t.common.showPassword}
            hideLabel={t.common.hidePassword}
            autoComplete="new-password"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium mb-2 text-tomris">
            {t.auth.register.gender}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(["kadin", "erkek"] as const).map((g) => (
              <label
                key={g}
                className={`flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-colors text-sm font-medium ${
                  gender === g
                    ? "selection-active border-2"
                    : "border-2 border-[var(--border)] hover:border-violet-200"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="sr-only"
                />
                {g === "kadin" ? t.dashboard.female : t.dashboard.male}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1"
          />
          <span className="text-[var(--muted)] leading-relaxed">
            {t.legal.registerAccept}{" "}
            <Link href="/kullanim-kosullari" className="link-tomris" target="_blank">
              {t.legal.termsLink}
            </Link>
            {" · "}
            <Link href="/gizlilik-politikasi" className="link-tomris" target="_blank">
              {t.legal.privacyLink}
            </Link>
          </span>
        </label>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t.auth.register.submitting : t.auth.register.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t.auth.register.hasAccount}{" "}
        <Link href="/giris" className="link-tomris">
          {t.auth.register.loginLink}
        </Link>
      </p>
    </AuthLayout>
  );
}
