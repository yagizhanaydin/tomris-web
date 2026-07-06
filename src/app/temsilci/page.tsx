"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";
import type { PlatformBan } from "@/types/ban";

const BAN_REASONS = [
  "Uygunsuz içerik (troll)",
  "Sahte profil / cinsiyet uyumsuzluğu",
  "Tekrarlayan kötü niyetli davranış",
] as const;

export default function RepPanelPage() {
  const router = useRouter();
  const [pending, setPending] = useState<UserProfile[]>([]);
  const [bans, setBans] = useState<PlatformBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionUid, setActionUid] = useState<string | null>(null);
  const [banModalUid, setBanModalUid] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<string>(BAN_REASONS[0]);
  const [showBans, setShowBans] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/temsilci/verifications");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Liste alınamadı.");
        return;
      }
      setPending(data.pending ?? []);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBans = useCallback(async () => {
    try {
      const res = await fetch("/api/temsilci/bans");
      const data = await res.json();
      if (res.ok) setBans(data.bans ?? []);
    } catch {
      // sessiz
    }
  }, []);

  useEffect(() => {
    loadPending();
    loadBans();
  }, [loadPending, loadBans]);

  const handleAction = async (uid: string, action: "approve" | "reject") => {
    setActionUid(uid);
    try {
      const res = await fetch(`/api/temsilci/verifications/${uid}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "İşlem başarısız.");
        return;
      }
      await loadPending();
    } finally {
      setActionUid(null);
    }
  };

  const handleBan = async () => {
    if (!banModalUid) return;
    const uid = banModalUid;
    setActionUid(uid);
    setBanModalUid(null);

    try {
      const res = await fetch(`/api/temsilci/verifications/${uid}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Yasaklama başarısız.");
        return;
      }
      await Promise.all([loadPending(), loadBans()]);
    } finally {
      setActionUid(null);
      setBanReason(BAN_REASONS[0]);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/temsilci/logout", { method: "POST" });
    router.push("/temsilci/giris");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-purple-300">Kadın Temsilci Paneli</h1>
            <p className="text-sm text-gray-400">
              Doğrulama yalnızca kadın temsilciler tarafından yapılır
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-purple-950/40 border border-purple-800 rounded-xl p-4 text-sm text-purple-200 space-y-2">
          <p>
            <strong>Kadın doğrulama ekibi:</strong> Hesap doğrulamasını yalnızca kadın
            temsilciler gerçekleştirir. Fotoğraflar geçici tutulur; onay, red veya yasak
            sonrası otomatik silinir.
          </p>
          <p className="text-purple-300/80">
            Uygunsuz içerik (troll fotoğrafları vb.) görürseniz <strong>Reddet</strong> değil{" "}
            <strong>Kalıcı Yasakla</strong> kullanın — hesap ve e-posta tekrar kayıt olamaz.
          </p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-purple-200">Bekleyen doğrulamalar</h2>
          <button
            onClick={() => setShowBans((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            {showBans ? "Listeyi Gizle" : `Yasaklılar (${bans.length})`}
          </button>
        </div>

        {showBans && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
            {bans.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz yasaklı hesap yok.</p>
            ) : (
              bans.map((ban) => (
                <div
                  key={ban.uid}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-gray-800 last:border-0 text-sm"
                >
                  <div>
                    <span className="text-purple-200 font-medium">@{ban.username}</span>
                    <span className="text-gray-500 ml-2">{ban.reason}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(ban.bannedAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Yükleniyor...</p>
        ) : pending.length === 0 ? (
          <p className="text-gray-400">Bekleyen doğrulama yok.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {pending.map((user) => (
              <div
                key={user.uid}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
              >
                {user.verificationPhotoPath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/temsilci/verifications/${user.uid}/photo`}
                    alt={`${user.username} doğrulama`}
                    className="w-full aspect-[4/3] object-cover bg-black"
                  />
                )}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-purple-200">@{user.username}</p>
                    <p className="text-sm text-gray-400">
                      Beyan edilen cinsiyet:{" "}
                      <span className="text-purple-200 font-medium">
                        {user.gender === "kadin" ? "Kadın" : "Erkek"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fotoğraf ile eşleşiyor mu kontrol edin
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(user.uid, "approve")}
                        disabled={actionUid === user.uid}
                        className="flex-1 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-sm font-medium disabled:opacity-50"
                      >
                        Onayla & Sil
                      </button>
                      <button
                        onClick={() => handleAction(user.uid, "reject")}
                        disabled={actionUid === user.uid}
                        className="flex-1 py-2 rounded-lg bg-amber-800 hover:bg-amber-700 text-sm font-medium disabled:opacity-50"
                      >
                        Reddet
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setBanModalUid(user.uid);
                        setBanReason(BAN_REASONS[0]);
                      }}
                      disabled={actionUid === user.uid}
                      className="w-full py-2 rounded-lg bg-red-900 hover:bg-red-800 border border-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Kalıcı Yasakla (troll / uygunsuz)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {banModalUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-red-300">Kalıcı Yasakla</h3>
            <p className="text-sm text-gray-400">
              Bu işlem geri alınamaz. Fotoğraf anında silinir, hesap devre dışı bırakılır ve
              aynı e-posta ile tekrar kayıt olunamaz.
            </p>
            <fieldset className="space-y-2">
              <legend className="text-sm text-gray-300 mb-2">Yasak nedeni</legend>
              {BAN_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="banReason"
                    value={reason}
                    checked={banReason === reason}
                    onChange={() => setBanReason(reason)}
                    className="accent-purple-500"
                  />
                  {reason}
                </label>
              ))}
            </fieldset>
            <div className="flex gap-2">
              <button
                onClick={() => setBanModalUid(null)}
                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
              >
                İptal
              </button>
              <button
                onClick={handleBan}
                className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-sm font-medium"
              >
                Yasakla & Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
