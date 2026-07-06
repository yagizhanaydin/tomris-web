"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPanelPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/giris");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Paneli</h1>
            <p className="text-sm text-gray-400">Tomris Web Yönetimi</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loggingOut ? "Çıkış..." : "Çıkış Yap"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Toplam Kullanıcı" value="—" subtitle="Firestore'dan çekilecek" />
          <StatCard title="Doğrulanmış" value="—" subtitle="Cinsiyet doğrulaması tamam" />
          <StatCard title="Bekleyen" value="—" subtitle="Doğrulama bekleyen" />
        </div>

        <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Kullanıcı Yönetimi</h2>
          <p className="text-gray-400 text-sm">
            Firebase Console üzerinden Firestore &quot;users&quot; koleksiyonundan
            kayıtlı kullanıcıları görüntüleyebilirsiniz. İleride buraya kullanıcı
            listesi eklenebilir.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
