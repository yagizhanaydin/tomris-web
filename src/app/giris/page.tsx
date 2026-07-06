"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace("/dashboard");
    }
    if (!loading && user && !profile) {
      router.replace("/kayit-tamamla");
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const { user: signedInUser } = credential;

      if (!signedInUser.emailVerified) {
        setError(
          "E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin."
        );
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("E-posta veya şifre hatalı.");
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

  return (
    <AuthLayout title="Giriş Yap" subtitle="Hesabınıza giriş yapın">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            E-posta
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
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors"
        >
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
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

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-[var(--primary)] hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </AuthLayout>
  );
}
