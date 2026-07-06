"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris");
    }
    if (!loading && user && !profile) {
      router.replace("/kayit-tamamla");
    }
  }, [user, profile, loading, router]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="font-semibold text-lg hidden sm:block">Tomris Web</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Hoş geldin, {profile.username}!
          </h1>
          <p className="text-[var(--muted)] mb-8">
            Hesabınız başarıyla doğrulandı.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="E-posta" value={profile.email} />
            <InfoCard
              label="Cinsiyet"
              value={profile.gender === "kadin" ? "Kadın" : "Erkek"}
            />
            <InfoCard
              label="Doğrulama"
              value={profile.genderVerified ? "Tamamlandı ✓" : "Bekliyor"}
            />
            <InfoCard
              label="Giriş Yöntemi"
              value={profile.authProvider === "google" ? "Google" : "E-posta / Şifre"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">{label}</p>
      <p className="font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}
