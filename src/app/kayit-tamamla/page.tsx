"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { GenderVerification } from "@/components/GenderVerification";
import { completeGoogleProfile } from "@/lib/auth-helpers";
import { useAuth } from "@/context/AuthProvider";
import type { Gender } from "@/types/user";

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [step, setStep] = useState<"form" | "verification">("form");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris");
    }
    if (!loading && profile) {
      router.replace("/dashboard");
    }
    if (user?.displayName) {
      setUsername(user.displayName);
    }
  }, [user, profile, loading, router]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      setError("Lütfen cinsiyet seçin.");
      return;
    }
    if (!username.trim()) {
      setError("Kullanıcı adı gerekli.");
      return;
    }
    setError("");
    setStep("verification");
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
    if (!user || !gender) return;
    setSubmitting(true);
    setError("");

    try {
      await completeGoogleProfile(
        user.uid,
        username,
        user.email ?? "",
        gender,
        photoBlob
      );
      await refreshProfile();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Profil tamamlanamadı.");
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (step === "verification") {
    return (
      <AuthLayout title="Profili Tamamla" subtitle="Cinsiyet doğrulama gerekli">
        {submitting ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--muted)]">Profiliniz kaydediliyor...</p>
          </div>
        ) : (
          <GenderVerification
            gender={gender as Gender}
            onCapture={handlePhotoCapture}
            onBack={() => setStep("form")}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Profili Tamamla"
      subtitle="Google ile giriş yaptınız — son adım kaldı"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1.5">
            Kullanıcı Adı
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium mb-2">Cinsiyet</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["kadin", "erkek"] as const).map((g) => (
              <label
                key={g}
                className={`flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-colors text-sm font-medium ${
                  gender === g
                    ? "border-[var(--primary)] bg-red-50 text-[var(--primary)]"
                    : "border-[var(--border)] hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="sr-only"
                />
                {g === "kadin" ? "Kadın" : "Erkek"}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-colors"
        >
          Devam Et — Fotoğraf Doğrulama
        </button>
      </form>
    </AuthLayout>
  );
}
