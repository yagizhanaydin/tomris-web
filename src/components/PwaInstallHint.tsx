"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallHint() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("tomris-pwa-install-dismiss") === "1") {
      setHidden(true);
      return;
    }
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setHidden(true);
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

  if (hidden || !deferred) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-primary-light/25 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-tomris">{t.pwa.installTitle}</p>
        <p className="text-xs text-[var(--muted)]">{t.pwa.installBody}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button type="button" onClick={install} className="btn-primary text-sm px-4 py-2">
          {t.pwa.installAction}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--muted)]"
        >
          {t.pwa.installDismiss}
        </button>
      </div>
    </div>
  );
}
