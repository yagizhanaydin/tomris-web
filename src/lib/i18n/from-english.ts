import { en } from "./en";
import type { TranslationDictionary } from "./types";

type AuthOverrides = {
  login?: Partial<TranslationDictionary["auth"]["login"]>;
  forgot?: Partial<TranslationDictionary["auth"]["forgot"]>;
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
      forgot: { ...en.auth.forgot, ...overrides.auth?.forgot },
    },
  };
}
