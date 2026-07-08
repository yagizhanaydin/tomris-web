"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { LOCALE_CODES } from "@/lib/i18n";
import { LanguageSheet } from "./LanguageSheet";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.common.selectLanguage}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 text-tomris hover:bg-[var(--primary-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomris/40 ${className}`}
      >
        <GlobeIcon />
        <span className="text-xs font-bold tracking-wide">{LOCALE_CODES[locale]}</span>
      </button>
      <LanguageSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
