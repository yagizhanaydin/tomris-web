"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { GenderVerification } from "@/components/GenderVerification";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { registerWithEmail } from "@/lib/auth-helpers";
import type { Gender } from "@/types/user";

type Step = "form" | "verification" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
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

    setStep("verification");
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
    setSubmitting(true);
    setError("");

    try {
      await registerWithEmail(username, email, password, gender as Gender, photoBlob);
      setStep("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu.";
      if (message.includes("email-already-in-use")) {
        setError("Bu e-posta adresi zaten kullanılıyor.");
      } else {
        setError(message);
      }
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <AuthLayout title="Kayıt Başarılı" subtitle="E-posta doğrulamanızı tamamlayın">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[var(--muted)]">
            Hesabınız oluşturuldu. <strong>{email}</strong> adresine bir doğrulama
            e-postası gönderdik. Lütfen e-postanızı doğruladıktan sonra giriş yapın.
          </p>
          <Link
            href="/giris"
            className="inline-block w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-colors"
          >
            Giriş Sayfasına Git
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (step === "verification") {
    return (
      <AuthLayout title="Kayıt Ol" subtitle="Son adım: cinsiyet doğrulama">
        {submitting ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--muted)]">Hesabınız oluşturuluyor...</p>
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
    <AuthLayout title="Kayıt Ol" subtitle="Yeni hesap oluşturun">
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
            placeholder="kullaniciadi"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            E-posta (Gmail)
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
            placeholder="ornek@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
            placeholder="En az 6 karakter"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
            Şifre Tekrar
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
            placeholder="Şifrenizi tekrar girin"
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-[var(--muted)]">veya</span>
        </div>
      </div>

      <GoogleSignInButton
        label="Google ile Kayıt Ol"
        onSuccess={() => router.push("/kayit-tamamla")}
      />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-[var(--primary)] hover:underline">
          Giriş Yap
        </Link>
      </p>
    </AuthLayout>
  );
}
