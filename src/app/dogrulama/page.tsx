"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { GenderVerification } from "@/components/GenderVerification";
import { VerificationIntro } from "@/components/VerificationIntro";
import { VerificationPrivacyConsent } from "@/components/VerificationPrivacyConsent";
import { VerificationAccessPanel } from "@/components/VerificationAccessPanel";
import { submitVerificationPhoto } from "@/lib/auth-helpers";
import { isPlatformUnlocked, isVerificationPending } from "@/lib/auth-routing";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function VerificationPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  useRedirectUnverifiedEmail();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && isPlatformUnlocked(profile)) {
      router.replace("/dashboard");
    }
    if (!loading && profile && isVerificationPending(profile) && !submitted) {
      router.replace("/dashboard");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router, submitted]);

  const handlePhotoCapture = async (photoBlob: Blob) => {
    if (!privacyConsent) {
      setConsentError(true);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitVerificationPhoto(photoBlob);
      await refreshProfile();
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
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

  if (submitted) {
    return (
      <AuthLayout title={t.verification.pageTitle} subtitle={t.verification.pageSubtitle}>
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-2">
            <p className="font-semibold text-emerald-900">{t.verification.submitSuccess}</p>
            <p className="text-sm text-emerald-800 leading-relaxed">
              {t.verification.submitSuccessDetail}
            </p>
          </div>
          <VerificationAccessPanel variant="submitted" />
          <Link
            href="/dashboard"
            className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            {t.verification.submitSuccessCta}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t.verification.pageTitle} subtitle={t.verification.pageSubtitle}>
      <div className="space-y-5">
        <VerificationIntro />
        <VerificationAccessPanel variant="unverified" showQueue={false} />

        <VerificationPrivacyConsent
          checked={privacyConsent}
          onChange={(value) => {
            setPrivacyConsent(value);
            if (value) setConsentError(false);
          }}
          showError={consentError}
        />

        {error && <div className="alert-error">{error}</div>}

        {submitting ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--muted)]">{t.common.loading}</p>
          </div>
        ) : privacyConsent ? (
          <GenderVerification
            gender={profile.gender}
            onCapture={handlePhotoCapture}
            onBack={() => router.push("/dashboard")}
          />
        ) : (
          <p className="text-sm text-center text-[var(--muted)] py-4">
            {t.verification.privacyConsentRequired}
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
