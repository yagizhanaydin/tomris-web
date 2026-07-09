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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-[var(--muted)] leading-relaxed">
          <span className="text-primary shrink-0 mt-0.5" aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

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
      <div className="space-y-5">
        <header className="card text-center space-y-4">
          <div className="flex justify-center">
            <TomrisMark size={72} className="rounded-2xl shadow-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tomris">{t.whyUs.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-lg mx-auto leading-relaxed">
              {t.whyUs.subtitle}
            </p>
          </div>
        </header>

        {t.whyUs.sections.map((section, i) => (
          <section key={i} className="card space-y-3">
            <div className="flex items-start gap-3">
              {section.icon ? (
                <span className="text-2xl shrink-0" aria-hidden>
                  {section.icon}
                </span>
              ) : null}
              <div className="space-y-3 min-w-0 flex-1">
                <h2 className="font-semibold text-tomris text-base leading-snug">{section.title}</h2>
                {section.intro && (
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{section.intro}</p>
                )}
                <BulletList items={section.items} />
              </div>
            </div>
          </section>
        ))}

        <section className="card space-y-3 bg-primary-light/20 border-primary/20">
          <h2 className="font-semibold text-tomris">{t.whyUs.verificationTitle}</h2>
          <BulletList items={t.whyUs.verificationItems} />
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

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/akis" className="btn-primary sm:w-auto sm:px-6 text-sm py-2.5">
            {t.whyUs.ctaFeed}
          </Link>
          <Link
            href="/mesajlar?tab=groups"
            className="text-sm py-2.5 px-5 rounded-xl border border-[var(--border)] hover:bg-primary-light/30"
          >
            {t.whyUs.ctaGroups}
          </Link>
          <Link
            href="/arkadaslar"
            className="text-sm py-2.5 px-5 rounded-xl border border-[var(--border)] hover:bg-primary-light/30"
          >
            {t.whyUs.ctaFriends}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
