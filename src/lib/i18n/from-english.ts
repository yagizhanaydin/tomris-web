import { en } from "./en";
import type { TranslationDictionary } from "./types";

type AuthOverrides = {
  login?: Partial<TranslationDictionary["auth"]["login"]>;
  register?: Partial<TranslationDictionary["auth"]["register"]>;
  completeProfile?: Partial<TranslationDictionary["auth"]["completeProfile"]>;
  google?: Partial<TranslationDictionary["auth"]["google"]>;
  forgot?: Partial<TranslationDictionary["auth"]["forgot"]>;
  verifyEmail?: Partial<TranslationDictionary["auth"]["verifyEmail"]>;
};

export function fromEnglish(overrides: {
  common?: Partial<TranslationDictionary["common"]>;
  brand?: Partial<TranslationDictionary["brand"]>;
  quote?: Partial<TranslationDictionary["quote"]>;
  auth?: AuthOverrides;
}): TranslationDictionary {
  return {
    ...en,
    common: { ...en.common, ...overrides.common },
    brand: { ...en.brand, ...overrides.brand },
    quote: { ...en.quote, ...overrides.quote },
    auth: {
      ...en.auth,
      login: { ...en.auth.login, ...overrides.auth?.login },
      register: { ...en.auth.register, ...overrides.auth?.register },
      completeProfile: { ...en.auth.completeProfile, ...overrides.auth?.completeProfile },
      google: { ...en.auth.google, ...overrides.auth?.google },
      forgot: { ...en.auth.forgot, ...overrides.auth?.forgot },
      verifyEmail: { ...en.auth.verifyEmail, ...overrides.auth?.verifyEmail },
    },
  };
}
