"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { needsProfileCompletion, isPlatformUnlocked } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { TomrisMark } from "@/components/TomrisMark";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function WhyUsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
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

  const unlocked = isPlatformUnlocked(profile);

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <header className="card text-center space-y-4">
          <div className="flex justify-center">
            <TomrisMark size={72} className="rounded-2xl shadow-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tomris">{t.whyUs.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto leading-relaxed">
              {t.whyUs.subtitle}
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {t.whyUs.pillars.map((pillar, i) => (
            <article key={i} className="card space-y-2">
              <span className="text-2xl" aria-hidden>
                {pillar.icon}
              </span>
              <h2 className="font-semibold text-tomris">{pillar.title}</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{pillar.body}</p>
            </article>
          ))}
        </div>

        <section className="card space-y-3 bg-primary-light/20">
          <h2 className="font-semibold text-tomris">{t.whyUs.verificationTitle}</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{t.whyUs.verificationBody}</p>
          {!unlocked && (
            <Link href="/dogrulama" className="btn-primary sm:w-auto sm:inline-block text-sm py-2.5 px-6">
              {t.whyUs.verificationCta}
            </Link>
          )}
        </section>

        <section className="card space-y-2 border-dashed">
          <h2 className="font-semibold text-tomris text-sm">{t.whyUs.darkModeTitle}</h2>
          <p className="text-xs text-[var(--muted)]">{t.whyUs.darkModeBody}</p>
          <Link href="/ayarlar" className="text-sm link-tomris inline-block">
            {t.whyUs.darkModeCta} →
          </Link>
        </section>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/akis" className="btn-primary sm:w-auto sm:px-8 text-sm py-2.5">
            {t.whyUs.ctaFeed}
          </Link>
          <Link
            href="/arkadaslar"
            className="text-sm py-2.5 px-6 rounded-xl border border-[var(--border)] hover:bg-primary-light/30"
          >
            {t.whyUs.ctaFriends}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
