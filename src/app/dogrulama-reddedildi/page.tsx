"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { AuthLayout } from "@/components/AuthLayout";

export default function VerificationRejectedPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && profile?.verificationStatus === "approved") {
      router.replace("/dashboard");
    }
    if (!loading && profile?.verificationStatus === "pending") {
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
    <AuthLayout title={t.verification.rejectedTitle} subtitle={t.verification.rejectedSubtitle}>
      <div className="text-center space-y-4">
        <div className="alert-error text-sm leading-relaxed text-left">
          {t.verification.rejectedBody}
        </div>
        <Link href="/dogrulama" className="btn-primary inline-block">
          {t.verification.rejectedRetry}
        </Link>
        <button onClick={handleLogout} className="btn-secondary w-full">
          {t.common.logout}
        </button>
      </div>
    </AuthLayout>
  );
}
