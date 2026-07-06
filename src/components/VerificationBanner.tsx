"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

export function VerificationBanner() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-2">
          <p className="font-semibold text-tomris">{t.verification.bannerTitle}</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {t.verification.bannerBody}
          </p>
        </div>
        <Link
          href="/dogrulama"
          className="shrink-0 inline-flex justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm"
        >
          {t.verification.bannerCta}
        </Link>
      </div>
    </div>
  );
}
