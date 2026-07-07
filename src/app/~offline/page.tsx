"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

export default function OfflinePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen tomris-gradient flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center space-y-4">
        <p className="text-4xl" aria-hidden>
          📡
        </p>
        <h1 className="text-xl font-bold text-tomris">{t.pwa.offlineTitle}</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{t.pwa.offlineBody}</p>
        <Link href="/dashboard" className="btn-primary inline-block">
          {t.pwa.offlineRetry}
        </Link>
      </div>
    </div>
  );
}
