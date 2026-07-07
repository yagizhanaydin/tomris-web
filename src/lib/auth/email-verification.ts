import { sendEmailVerification, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { isLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "tomris_locale";

const FIREBASE_EMAIL_LANG: Record<string, string> = {
  tr: "tr",
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
};

function readStoredLocale(): string {
  if (typeof window === "undefined") return "tr";
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : "tr";
}

/** Firebase Auth e-posta şablon dili (Console'daki TR/EN metinleri) */
export function applyAuthEmailLanguage(locale?: string): void {
  const auth = getFirebaseAuth();
  const code = locale ?? readStoredLocale();
  auth.languageCode = FIREBASE_EMAIL_LANG[code] ?? "tr";
}

export async function sendTomrisEmailVerification(user: User): Promise<void> {
  applyAuthEmailLanguage();
  await sendEmailVerification(user, {
    url: `${window.location.origin}/dashboard`,
    handleCodeInApp: false,
  });
}
