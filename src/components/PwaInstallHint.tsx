"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

export function PwaInstallHint() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("tomris-pwa-install-dismiss") === "1") {
      setHidden(true);
      return;
    }
    if (isStandalone()) {
      setHidden(true);
      return;
    }

    if (isIosBrowser()) {
      setIosMode(true);
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem("tomris-pwa-install-dismiss", "1");
    setHidden(true);
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (hidden) return null;
  if (!iosMode && !deferred) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-primary-light/25 p-4 space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-tomris">
          {iosMode ? t.pwa.installIosTitle : t.pwa.installTitle}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {iosMode ? t.pwa.installIosBody : t.pwa.installBody}
        </p>
      </div>

      {iosMode ? (
        <ol className="text-xs text-[var(--muted)] space-y-1.5 list-decimal list-inside pl-1">
          {t.pwa.installIosSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ) : null}

      <div className="flex gap-2 shrink-0">
        {!iosMode && (
          <button type="button" onClick={install} className="btn-primary text-sm px-4 py-2 sm:w-auto">
            {t.pwa.installAction}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="text-sm px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--muted)] sm:w-auto"
        >
          {t.pwa.installDismiss}
        </button>
      </div>
    </div>
  );
}
