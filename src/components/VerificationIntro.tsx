"use client";

import { useLanguage } from "@/context/LanguageProvider";

export function VerificationIntro() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 space-y-3">
      <p className="font-semibold text-tomris text-lg">{t.verification.introTitle}</p>
      <p className="text-sm text-[var(--foreground)] leading-relaxed">
        {t.verification.introBody}
      </p>
      <p className="text-xs text-[var(--muted)] leading-relaxed border-t border-violet-100 pt-3">
        {t.verification.introNote}
      </p>
    </div>
  );
}
