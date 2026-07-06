"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AuthLayout } from "@/components/AuthLayout";
import { registerWithEmail, createGoogleProfile, checkEmailNotBanned } from "@/lib/auth-helpers";
import { getPostAuthRedirect } from "@/lib/auth-routing";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageProvider";

import type { Gender, UserProfile } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!gender) {
      setError("Lütfen cinsiyet seçin.");
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(username, email, password, gender as Gender);
      setSuccessEmail(email);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu.";
      if (message === "BANNED_EMAIL") {
        setError(t.ban.registerBlocked);
      } else if (message.includes("email-already-in-use")) {
        setError("Bu e-posta adresi zaten kullanılıyor.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");

    if (!username.trim()) {
      setError("Google ile kayıt için kullanıcı adı girin.");
      return;
    }
    if (!gender) {
      setError("Google ile kayıt için önce cinsiyet seçin.");
      return;
    }

    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getFirebaseAuth(), provider);

      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Google oturumu açılamadı.");

      await checkEmailNotBanned(user.email ?? "");

      const snap = await getDoc(doc(getFirebaseDb(), "users", user.uid));
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        router.replace(getPostAuthRedirect(profile));
        return;
      }

      await createGoogleProfile(user.uid, username, user.email ?? "", gender as Gender);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google kaydı başarısız oldu.";
      if (message === "BANNED_EMAIL") {
        await getFirebaseAuth().signOut();
        setError(t.ban.registerBlocked);
      } else if (!message.includes("popup-closed")) {
        setError(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (successEmail) {
    return (
      <AuthLayout title="Kayıt Başarılı" subtitle="Hoş geldin!">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-8 h-8 text-tomris" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            Hesabın oluşturuldu! <strong>{successEmail}</strong> adresine doğrulama e-postası
            gönderdik. Siteyi gezebilirsin; arkadaşlık ve diğer özellikler için istediğin
            zaman fotoğraf doğrulamasını tamamlayabilirsin.
          </p>
          <Link href="/dashboard" className="btn-primary inline-block text-center">
            Ana Sayfaya Git
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Kayıt Ol" subtitle="Yeni hesap oluşturun">
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
            placeholder="kullaniciadi"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-tomris">
            E-posta (Gmail)
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="ornek@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-tomris">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="En az 6 karakter"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-tomris">
            Şifre Tekrar
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Şifrenizi tekrar girin"
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
          {submitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-[var(--muted)]">veya</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={googleLoading || !gender || !username.trim()}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--border)] bg-white font-medium text-tomris hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {googleLoading ? "Google ile bağlanılıyor..." : "Google ile Kayıt Ol"}
      </button>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="link-tomris">
          Giriş Yap
        </Link>
      </p>
    </AuthLayout>
  );
}
