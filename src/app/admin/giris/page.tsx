"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";

export default function AdminLoginPage() {
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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Giriş başarısız.");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Girişi"
      subtitle="Bu alan yalnızca yöneticiler içindir"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
            {error}
          </div>
        )}

        <p className="text-xs text-[var(--muted)] bg-amber-50 border border-amber-200 rounded-lg p-3">
          Normal kullanıcı hesapları (e-posta/şifre veya Google) admin paneline erişemez.
        </p>

        <div>
          <label htmlFor="admin-username" className="block text-sm font-medium mb-1.5">
            Admin Kullanıcı Adı
          </label>
          <input
            id="admin-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium mb-1.5">
            Admin Şifresi
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-base"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Giriş yapılıyor..." : "Admin Paneline Gir"}
        </button>
      </form>
    </AuthLayout>
  );
}
