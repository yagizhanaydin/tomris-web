"use client";

import { useLanguage } from "@/context/LanguageProvider";
import { LOCALE_ARIA, LOCALE_CODES, SUPPORTED_LOCALES } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={`flex flex-col gap-1 ${className}`}
      role="group"
      aria-label={t.common.selectLanguage}
    >
      {SUPPORTED_LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-label={LOCALE_ARIA[code]}
            aria-current={active ? "true" : undefined}
            className={`w-10 text-xs sm:text-sm py-1.5 rounded-lg border font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomris/40 ${
              active
                ? "border-tomris bg-tomris text-white"
                : "border-[var(--border)] bg-white/90 text-tomris hover:bg-[var(--primary-light)]"
            }`}
          >
            {LOCALE_CODES[code]}
          </button>
        );
      })}
    </div>
  );
}
