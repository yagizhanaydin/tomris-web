import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { tr } from "./tr";
import type { Locale, TranslationDictionary } from "./types";

export { SUPPORTED_LOCALES, LOCALE_CODES, LOCALE_ARIA, isLocale, localeToIntl } from "./locales";

export const locales: Locale[] = ["tr", "en", "de", "fr", "es"];
export const defaultLocale: Locale = "tr";

const dictionaries: Record<Locale, TranslationDictionary> = { tr, en, de, fr, es };

export function getDictionary(locale: Locale): TranslationDictionary {
  return dictionaries[locale] ?? dictionaries.tr;
}

export type Dictionary = TranslationDictionary;

export function interpolate(
  template: string,
  params: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}
