"use client";

import { useLanguage } from "@/context/LanguageProvider";

export function AtaturkQuote() {
  const { t } = useLanguage();

  return (
    <blockquote className="border-l-4 border-[var(--primary)] pl-4 py-2 bg-[var(--primary-light)]/50 rounded-r-xl">
      <p className="text-sm sm:text-base italic text-[var(--muted)] leading-relaxed">
        &ldquo;{t.quote.text}&rdquo;
      </p>
      <footer className="mt-2 text-xs sm:text-sm font-semibold text-tomris">
        — {t.quote.author}
      </footer>
    </blockquote>
  );
}
