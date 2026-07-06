"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { AuthLayout } from "@/components/AuthLayout";

export default function AccountBannedPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && profile && profile.verificationStatus !== "banned") {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout title={t.ban.pageTitle} subtitle={t.ban.pageSubtitle}>
      <div className="text-center space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-left space-y-2">
          <p className="text-sm text-red-800 leading-relaxed">{t.ban.body}</p>
          {profile?.banReason && (
            <p className="text-xs text-red-600">
              {t.ban.reasonLabel}: {profile.banReason}
            </p>
          )}
        </div>
        <p className="text-xs text-[var(--muted)]">{t.ban.noReturn}</p>
        <button onClick={handleLogout} className="btn-primary">
          {t.common.logout}
        </button>
      </div>
    </AuthLayout>
  );
}
