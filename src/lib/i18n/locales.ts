import type { Locale } from "./types";

export const SUPPORTED_LOCALES: readonly Locale[] = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
] as const;

export const LOCALE_CODES: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
  fr: "FR",
  es: "ES",
};

/** Screen reader only — not shown in UI */
export const LOCALE_ARIA: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

const INTL_MAP: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return (
    value !== null &&
    value !== undefined &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function localeToIntl(locale: Locale): string {
  return INTL_MAP[locale] ?? "en-GB";
}
