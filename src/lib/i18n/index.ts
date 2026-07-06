import { en } from "./en";
import { tr } from "./tr";
import type { Locale, TranslationDictionary } from "./types";

export const locales: Locale[] = ["tr", "en"];
export const defaultLocale: Locale = "tr";

const dictionaries: Record<Locale, TranslationDictionary> = { tr, en };

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
