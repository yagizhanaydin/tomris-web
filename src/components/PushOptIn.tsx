"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { isPlatformUnlocked } from "@/lib/auth-routing";
import { isPushSupported, registerWebPushToken } from "@/lib/push/client";
import { permissionsAlreadyHandled } from "@/lib/permissions";

const STORAGE_KEY = "tomris-push-v1";
const SKIP_PREFIXES = [
  "/giris",
  "/kayit",
  "/eposta-dogrula",
  "/admin",
  "/temsilci",
  "/kullanim-kosullari",
  "/gizlilik-politikasi",
  "/hesap-yasaklandi",
  "/~offline",
];

function pushAlreadyHandled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function markPushHandled(): void {
  localStorage.setItem(STORAGE_KEY, "1");
}

export function PushOptIn() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isPushSupported().then((ok) => {
      if (!cancelled) setSupported(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !user || !profile || !supported) return;
    if (!isPlatformUnlocked(profile)) return;
    if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;
    if (!permissionsAlreadyHandled()) return;
    if (pushAlreadyHandled()) return;
    if (typeof Notification !== "undefined" && Notification.permission !== "default") {
      markPushHandled();
      return;
    }
    setOpen(true);
  }, [loading, user, profile, pathname, supported]);

  const close = () => {
    markPushHandled();
    setOpen(false);
  };

  const handleEnable = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const token = await user.getIdToken();
      await registerWebPushToken(token);
    } finally {
      markPushHandled();
      setBusy(false);
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-xl"
        role="dialog"
        aria-labelledby="push-title"
      >
        <h2 id="push-title" className="text-lg font-semibold text-tomris">
          {t.pwa.pushTitle}
        </h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{t.pwa.pushBody}</p>
        <ul className="text-sm space-y-2 text-tomris">
          {t.pwa.pushPoints.map((point) => (
            <li key={point}>🔔 {point}</li>
          ))}
        </ul>
        <p className="text-xs text-[var(--muted)]">{t.pwa.pushNote}</p>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
          >
            {busy ? t.pwa.pushEnabling : t.pwa.pushEnable}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)]"
          >
            {t.pwa.pushLater}
          </button>
        </div>
      </div>
    </div>
  );
}
