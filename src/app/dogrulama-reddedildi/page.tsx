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
      router.replace("/dogrulama-bekliyor");
    }
  }, [user, profile, loading, router]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  if (loading) return null;

  return (
    <AuthLayout title="Doğrulama Reddedildi" subtitle="Hesabınız onaylanmadı">
      <div className="text-center space-y-4">
        <div className="alert-error">
          Doğrulama fotoğrafınız temsilciler tarafından reddedildi. Fotoğrafınız
          silinmiştir. Tekrar deneyebilir veya destek için bizimle iletişime geçebilirsiniz.
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
