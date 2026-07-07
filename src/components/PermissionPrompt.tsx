"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import {
  markPermissionsHandled,
  permissionsAlreadyHandled,
  requestTomrisPermissions,
} from "@/lib/permissions";

const SKIP_PREFIXES = [
  "/giris",
  "/kayit",
  "/eposta-dogrula",
  "/admin",
  "/temsilci",
  "/kullanim-kosullari",
  "/gizlilik-politikasi",
  "/hesap-yasaklandi",
];

export function PermissionPrompt() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ camera: boolean; location: boolean } | null>(null);

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (profile.verificationStatus === "banned") return;
    if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;
    if (permissionsAlreadyHandled()) return;

    setOpen(true);
  }, [loading, user, profile, pathname]);

  const close = () => {
    markPermissionsHandled();
    setOpen(false);
  };

  const handleAllow = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await requestTomrisPermissions();
      setResult(res);
      markPermissionsHandled();
      window.setTimeout(() => setOpen(false), 1200);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/45">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-xl"
        role="dialog"
        aria-labelledby="perm-title"
      >
        <h2 id="perm-title" className="text-lg font-semibold text-tomris">
          {t.permissions.title}
        </h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{t.permissions.body}</p>
        <ul className="text-sm space-y-2 text-tomris">
          <li>📷 {t.permissions.cameraHint}</li>
          <li>📍 {t.permissions.locationHint}</li>
        </ul>
        <p className="text-xs text-[var(--muted)]">{t.permissions.note}</p>

        {result && (
          <div className="text-xs space-y-1 rounded-xl bg-primary-light/30 p-3">
            <p className={result.camera ? "text-green-700" : "text-[var(--muted)]"}>
              {result.camera ? t.permissions.cameraOk : t.permissions.cameraDenied}
            </p>
            <p className={result.location ? "text-green-700" : "text-[var(--muted)]"}>
              {result.location ? t.permissions.locationOk : t.permissions.locationDenied}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleAllow}
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
          >
            {busy ? t.permissions.requesting : t.permissions.allow}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)]"
          >
            {t.permissions.later}
          </button>
        </div>
      </div>
    </div>
  );
}
