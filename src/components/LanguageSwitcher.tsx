"use client";

import { useLanguage } from "@/context/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    const next: Locale = locale === "tr" ? "en" : "tr";
    setLocale(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
      className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] text-tomris font-medium hover:bg-[var(--primary-light)] transition-colors ${className}`}
    >
      {locale === "tr" ? "EN" : "TR"}
    </button>
  );
}
