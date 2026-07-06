"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { LOCALE_ARIA, LOCALE_CODES, SUPPORTED_LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

interface LanguageSheetProps {
  open: boolean;
  onClose: () => void;
}

export function LanguageSheet({ open, onClose }: LanguageSheetProps) {
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const pick = (code: Locale) => {
    setLocale(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t.common.cancel}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-sheet-title"
        className="relative bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.25s_ease-out]"
      >
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-[var(--border)]">
          <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-3" aria-hidden />
          <h2 id="language-sheet-title" className="text-base font-semibold text-tomris text-center">
            {t.common.selectLanguage}
          </h2>
        </div>

        <ul className="p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {SUPPORTED_LOCALES.map((code) => {
            const active = locale === code;
            return (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => pick(code)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-left transition-colors ${
                    active
                      ? "bg-primary-light text-tomris font-medium"
                      : "text-tomris hover:bg-primary-light/50"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center text-xs font-bold ${
                        active ? "border-tomris bg-white" : "border-[var(--border)] bg-white/80"
                      }`}
                    >
                      {LOCALE_CODES[code]}
                    </span>
                    <span className="text-sm truncate">{LOCALE_ARIA[code]}</span>
                  </span>
                  {active && (
                    <span className="text-tomris shrink-0" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
