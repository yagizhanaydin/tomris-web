"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import {
  needsProfileCompletion,
  isPlatformUnlocked,
} from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { AtaturkQuote } from "@/components/AtaturkQuote";
import { VerificationStatusBanner } from "@/components/VerificationStatusBanner";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t, ti } = useLanguage();
  useRedirectUnverifiedEmail();

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

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const verificationLabel = isPlatformUnlocked(profile)
    ? t.verification.statusApproved
    : profile.verificationStatus === "pending"
      ? t.verification.statusPending
      : t.verification.statusUnverified;

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        {!isPlatformUnlocked(profile) && <VerificationStatusBanner />}

        <div className="card">
          <h1 className="text-xl sm:text-3xl font-bold text-tomris mb-1">
            {ti(t.dashboard.welcome, { name: profile.username })}
          </h1>
          <p className="text-[var(--muted)] text-sm sm:text-base mb-6">{t.dashboard.joined}</p>

          <div className="mb-6">
            <AtaturkQuote />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard label={t.dashboard.email} value={user.email ?? "—"} />
            <InfoCard
              label={t.dashboard.gender}
              value={profile.gender === "kadin" ? t.dashboard.female : t.dashboard.male}
            />
            <InfoCard label={t.dashboard.verification} value={verificationLabel} />
            <InfoCard
              label={t.dashboard.authMethod}
              value={
                profile.authProvider === "google"
                  ? t.dashboard.google
                  : t.dashboard.emailPassword
              }
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-tomris mb-3">{t.nav.feed}</h2>
          <p className="text-sm text-[var(--muted)] mb-4">{t.posts.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/akis"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              {t.nav.feed} →
            </Link>
            {isPlatformUnlocked(profile) && (
              <Link
                href="/arkadaslar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] text-tomris font-medium hover:bg-primary-light transition-colors"
              >
                {t.dashboard.friends} →
              </Link>
            )}
          </div>
          <ul className="space-y-2 text-sm text-[var(--muted)] mt-4">
            <li>
              <Link
                href="/sinyal"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors"
              >
                🆘 {t.dashboard.signal} →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-primary-light/30 p-4">
      <p className="text-xs text-tomris uppercase tracking-wide mb-1 font-medium">{label}</p>
      <p className="font-medium text-[var(--foreground)] text-sm sm:text-base break-all">{value}</p>
    </div>
  );
}
