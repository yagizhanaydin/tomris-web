"use client";

import { useLanguage } from "@/context/LanguageProvider";

export function VerificationIntro() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 space-y-4">
      <p className="font-semibold text-tomris text-lg">{t.verification.introTitle}</p>
      <p className="text-sm text-[var(--foreground)] leading-relaxed">
        {t.verification.introBody}
      </p>
      <ul className="text-sm text-[var(--foreground)] space-y-2 pl-1">
        {t.verification.introPoints.map((point) => (
          <li key={point} className="flex gap-2 leading-relaxed">
            <span className="text-tomris shrink-0" aria-hidden>
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[var(--muted)] leading-relaxed border-t border-violet-100 pt-3">
        {t.verification.introNote}
      </p>
    </div>
  );
}
