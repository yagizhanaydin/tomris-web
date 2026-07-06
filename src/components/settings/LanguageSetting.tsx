"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { LOCALE_ARIA, LOCALE_CODES } from "@/lib/i18n";
import { LanguageSheet } from "@/components/LanguageSheet";

export function LanguageSetting() {
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="card space-y-3">
      <div>
        <h2 className="font-semibold text-tomris">{t.settings.languageTitle}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{t.settings.languageHint}</p>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-white hover:bg-primary-light/30 transition-colors text-left"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-lg border border-[var(--border)] flex items-center justify-center text-xs font-bold text-tomris bg-white">
            {LOCALE_CODES[locale]}
          </span>
          <span className="text-sm text-tomris font-medium truncate">{LOCALE_ARIA[locale]}</span>
        </span>
        <span className="text-sm link-tomris shrink-0">{t.settings.languageChange}</span>
      </button>

      <LanguageSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
