"use client";

import { useLanguage } from "@/context/LanguageProvider";

export function BetaNotice() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-1.5 mt-3">
      <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary-light/35 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary">
        {t.beta.badge}
      </span>
      <p className="text-xs text-[var(--muted)] max-w-xs leading-relaxed text-center">{t.beta.notice}</p>
    </div>
  );
}
