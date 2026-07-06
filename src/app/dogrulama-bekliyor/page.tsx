"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { AuthLayout } from "@/components/AuthLayout";

export default function VerificationPendingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile?.verificationStatus === "approved") {
      router.replace("/dashboard");
    }
    if (!loading && profile?.verificationStatus === "rejected") {
      router.replace("/dogrulama-reddedildi");
    }
  }, [user, profile, loading, router]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout title="Doğrulama Bekleniyor" subtitle="Kadın temsilciler fotoğrafınızı inceliyor">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-3xl">⏳</span>
        </div>
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          Doğrulama fotoğrafın kadın temsilciler tarafından inceleniyor. Onaylandığında
          fotoğraf kalıcı olarak silinir ve hesabın aktif olur.
        </p>
        <button onClick={handleLogout} className="btn-primary">
          {t.common.logout}
        </button>
      </div>
    </AuthLayout>
  );
}
