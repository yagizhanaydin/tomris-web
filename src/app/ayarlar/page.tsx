"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { needsProfileCompletion } from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { ChatVisibilitySetting } from "@/components/settings/ChatVisibilitySetting";
import { DeleteAccountSetting } from "@/components/settings/DeleteAccountSetting";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();

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

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-tomris">{t.settings.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t.settings.subtitle}</p>
        </div>

        <ChatVisibilitySetting profile={profile} onUpdated={refreshProfile} />

        <div className="card space-y-3">
          <h2 className="font-semibold text-tomris">{t.settings.legalTitle}</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/kullanim-kosullari" className="link-tomris">
              {t.legal.termsLink}
            </Link>
            <Link href="/gizlilik-politikasi" className="link-tomris">
              {t.legal.privacyLink}
            </Link>
          </div>
        </div>

        <DeleteAccountSetting />
      </div>
    </AppShell>
  );
}
