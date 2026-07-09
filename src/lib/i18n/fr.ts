import { fromEnglish, mergeLocaleOverrides } from "./from-english";
import { frOverrides } from "./locales/fr-overrides";
import { frExtension } from "./locales/fr-extension";

export const fr = fromEnglish(mergeLocaleOverrides(frOverrides, frExtension));
