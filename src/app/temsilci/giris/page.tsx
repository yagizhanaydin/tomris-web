"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";

export default function RepLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/temsilci/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Giriş başarısız.");
        return;
      }

      router.push("/temsilci");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Kadın Temsilci Girişi"
      subtitle="Doğrulama yalnızca kadın temsilciler tarafından yapılır"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <p className="text-xs text-[var(--muted)] bg-primary-light border border-[var(--border)] rounded-lg p-3 leading-relaxed">
          Kadın temsilciler kayıt fotoğraflarını inceler. Uygunsuz içerik (troll vb.)
          görürseniz <strong>kalıcı yasakla</strong> — fotoğraf anında silinir, hesap
          tekrar kayıt olamaz.
        </p>

        <div>
          <label htmlFor="rep-username" className="block text-sm font-medium mb-1.5 text-tomris">
            Temsilci Kullanıcı Adı
          </label>
          <input
            id="rep-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="rep-password" className="block text-sm font-medium mb-1.5 text-tomris">
            Şifre
          </label>
          <input
            id="rep-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Giriş yapılıyor..." : "Temsilci Paneline Gir"}
        </button>
      </form>
    </AuthLayout>
  );
}
