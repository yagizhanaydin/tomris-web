"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { GenderVerification } from "@/components/GenderVerification";
import { VerificationIntro } from "@/components/VerificationIntro";
import { submitVerificationPhoto } from "@/lib/auth-helpers";
import { isPlatformUnlocked } from "@/lib/auth-routing";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";

export default function VerificationPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && isPlatformUnlocked(profile)) {
      router.replace("/dashboard");
    }
    if (!loading && profile?.verificationStatus === "pending") {
      router.replace("/dogrulama-bekliyor");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router]);

  const handlePhotoCapture = async (photoBlob: Blob) => {
    setSubmitting(true);
    setError("");

    try {
      await submitVerificationPhoto(photoBlob);
      await refreshProfile();
      router.push("/dogrulama-bekliyor");
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

  return (
    <AuthLayout title={t.verification.pageTitle} subtitle={t.verification.pageSubtitle}>
      <div className="space-y-5">
        <VerificationIntro />

        {error && <div className="alert-error">{error}</div>}

        {submitting ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--muted)]">{t.common.loading}</p>
          </div>
        ) : (
          <GenderVerification
            gender={profile.gender}
            onCapture={handlePhotoCapture}
            onBack={() => router.push("/dashboard")}
          />
        )}
      </div>
    </AuthLayout>
  );
}
