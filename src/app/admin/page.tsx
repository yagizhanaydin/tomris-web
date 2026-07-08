"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Report } from "@/types/report";
import type { RepPublic } from "@/lib/reps/service";

type Tab = "overview" | "moderation" | "reps";

interface AdminStats {
  totalUsers: number;
  approvedUsers: number;
  pendingVerification: number;
  openReports: number;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loggingOut, setLoggingOut] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reps, setReps] = useState<RepPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const [newRepUsername, setNewRepUsername] = useState("");
  const [newRepPassword, setNewRepPassword] = useState("");
  const [creatingRep, setCreatingRep] = useState(false);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    if (res.ok) setStats(data.stats);
  }, []);

  const loadReports = useCallback(async () => {
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    if (res.ok) setReports(data.reports ?? []);
  }, []);

  const loadReps = useCallback(async () => {
    const res = await fetch("/api/admin/reps");
    const data = await res.json();
    if (res.ok) setReps(data.reps ?? []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadStats(), loadReports(), loadReps()]);
    } catch {
      setError("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadReports, loadReps]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/giris");
  };

  const moderationAction = async (
    body: Record<string, string>,
    actionKey: string
  ) => {
    setActionId(actionKey);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "İşlem başarısız.");
        return;
      }
      await Promise.all([loadReports(), loadStats()]);
    } finally {
      setActionId(null);
    }
  };

  const handleResolveReport = (reportId: string) => {
    moderationAction({ action: "resolve", reportId }, `resolve:${reportId}`);
  };

  const handleDeleteContent = (report: Report) => {
    if (report.targetType === "user") {
      alert("Kullanıcı şikayetleri temsilci panelinden yönetilir.");
      return;
    }

    const label =
      report.targetType === "post"
        ? "gönderi"
        : report.targetType === "comment"
          ? "yorum"
          : "mesaj";

    if (!confirm(`Bu ${label} kalıcı olarak silinsin mi?`)) return;

    if (report.targetType === "conversation") {
      const msg = report.messageContext?.[report.messageContext.length - 1];
      if (!msg) {
        alert("Silinecek mesaj bulunamadı.");
        return;
      }
      moderationAction(
        {
          action: "delete",
          targetType: "conversation",
          targetId: msg.messageId,
          conversationId: report.targetId,
        },
        `delete:${report.id}`
      );
      return;
    }

    moderationAction(
      {
        action: "delete",
        targetType: report.targetType,
        targetId: report.targetId,
      },
      `delete:${report.id}`
    );
  };

  const handleDeleteMessage = (report: Report, messageId: string) => {
    if (!confirm("Bu mesaj kalıcı olarak silinsin mi?")) return;
    moderationAction(
      {
        action: "delete",
        targetType: "conversation",
        targetId: messageId,
        conversationId: report.targetId,
      },
      `msg:${messageId}`
    );
  };

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRep(true);
    try {
      const res = await fetch("/api/admin/reps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newRepUsername, password: newRepPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Temsilci eklenemedi.");
        return;
      }
      setNewRepUsername("");
      setNewRepPassword("");
      await loadReps();
    } finally {
      setCreatingRep(false);
    }
  };

  const handleDeactivateRep = async (username: string) => {
    if (!confirm(`@${username} temsilci hesabı devre dışı bırakılsın mı?`)) return;
    const res = await fetch(`/api/admin/reps/${encodeURIComponent(username)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "İşlem başarısız.");
      return;
    }
    await loadReps();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Admin Paneli</h1>
            <p className="text-sm text-gray-400">Moderasyon ve temsilci yönetimi</p>
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

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex flex-wrap gap-2">
          {(
            [
              ["overview", "Genel Bakış"],
              ["moderation", "Moderasyon"],
              ["reps", "Temsilciler"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? "bg-purple-700 text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Toplam Kullanıcı" value={stats?.totalUsers ?? "—"} />
            <StatCard title="Doğrulanmış" value={stats?.approvedUsers ?? "—"} />
            <StatCard title="Bekleyen Doğrulama" value={stats?.pendingVerification ?? "—"} />
            <StatCard title="Açık Şikayet" value={stats?.openReports ?? "—"} />
          </div>
        )}

        {tab === "moderation" && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Şikayetler — içerik silme</h2>
              <p className="text-sm text-gray-400 mt-1">
                Yorum, gönderi ve mesaj silme işlemlerini buradan yapabilirsin. Doğrulama
                incelemesi temsilci panelinde kalır.
              </p>
            </div>

            {loading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-500 text-sm">Açık şikayet yok.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-200">
                        {report.targetType}
                      </span>
                      <span>@{report.reporterUsername}</span>
                      <span>{new Date(report.createdAt).toLocaleString("tr-TR")}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{report.reason}</p>
                    <p className="text-xs text-gray-500 font-mono break-all">
                      Hedef: {report.targetId}
                    </p>

                    {report.messageContext && report.messageContext.length > 0 && (
                      <div className="rounded-lg bg-gray-950 border border-gray-800 p-3 space-y-2">
                        <p className="text-xs text-gray-500">Mesaj bağlamı:</p>
                        {report.messageContext.map((msg) => (
                          <div
                            key={msg.messageId}
                            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 text-xs"
                          >
                            <p className="text-gray-300 min-w-0">
                              <span className="text-purple-300">@{msg.authorUsername}</span>:{" "}
                              {msg.content}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(report, msg.messageId)}
                              disabled={actionId === `msg:${msg.messageId}`}
                              className="shrink-0 px-2 py-1 rounded bg-red-900/80 hover:bg-red-800 disabled:opacity-50"
                            >
                              Mesajı sil
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {report.targetType !== "user" && report.targetType !== "conversation" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteContent(report)}
                          disabled={actionId === `delete:${report.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 disabled:opacity-50"
                        >
                          İçeriği sil
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id)}
                        disabled={actionId === `resolve:${report.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                      >
                        Kapat (görüldü)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "reps" && (
          <section className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-2">Yeni temsilci ekle</h2>
              <p className="text-sm text-gray-400 mb-4">
                Firestore&apos;da saklanır. Eski REP_USERNAME/REP_PASSWORD env değişkeni de
                çalışmaya devam eder.
              </p>
              <form onSubmit={handleCreateRep} className="grid gap-3 sm:grid-cols-2 max-w-xl">
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={newRepUsername}
                  onChange={(e) => setNewRepUsername(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm"
                  required
                  minLength={3}
                />
                <input
                  type="password"
                  placeholder="Şifre (min 8 karakter)"
                  value={newRepPassword}
                  onChange={(e) => setNewRepPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm"
                  required
                  minLength={8}
                />
                <button
                  type="submit"
                  disabled={creatingRep}
                  className="sm:col-span-2 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-sm font-medium disabled:opacity-50"
                >
                  {creatingRep ? "Ekleniyor..." : "Temsilci Oluştur"}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Kayıtlı temsilciler</h2>
              {reps.length === 0 ? (
                <p className="text-sm text-gray-500">Henüz Firestore temsilcisi yok.</p>
              ) : (
                <ul className="space-y-2">
                  {reps.map((rep) => (
                    <li
                      key={rep.username}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-gray-800 last:border-0"
                    >
                      <div>
                        <span className="text-purple-200 font-medium">@{rep.username}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {rep.active ? "Aktif" : "Pasif"} ·{" "}
                          {new Date(rep.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      {rep.active && (
                        <button
                          type="button"
                          onClick={() => handleDeactivateRep(rep.username)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-red-900"
                        >
                          Devre dışı bırak
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
