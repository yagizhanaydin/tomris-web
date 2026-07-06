"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { createGoogleProfile } from "@/lib/auth-helpers";
import { getPostAuthRedirect, needsProfileCompletion } from "@/lib/auth-routing";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import type { Gender } from "@/types/user";

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris");
      return;
    }
    if (!loading && profile && !needsProfileCompletion(profile)) {
      router.replace(getPostAuthRedirect(user, profile));
    }
    if (user?.displayName && !username) {
      setUsername(user.displayName);
    }
  }, [user, profile, loading, router, username]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      setError("Lütfen cinsiyet seçin.");
      return;
    }
    if (!username.trim()) {
      setError("Kullanıcı adı gerekli.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setError("");

    try {
      await createGoogleProfile(user.uid, username, user.email ?? "", gender);
      await refreshProfile();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "CONTENT_BLOCKED") {
        setError(t.common.contentBlocked);
      } else if (message === "INVALID_USERNAME") {
        setError(t.friends.invalidUsername);
      } else {
        setError(message || "Profil tamamlanamadı.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Profili Tamamla"
      subtitle="Google ile giriş yaptınız — birkaç bilgi kaldı"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1.5 text-tomris">
            Kullanıcı Adı
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium mb-2 text-tomris">Cinsiyet</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["kadin", "erkek"] as const).map((g) => (
              <label
                key={g}
                className={`flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-colors text-sm font-medium ${
                  gender === g
                    ? "selection-active border-2"
                    : "border-2 border-[var(--border)] hover:border-violet-200"
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

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Kaydediliyor..." : "Devam Et"}
        </button>
      </form>
    </AuthLayout>
  );
}
