import { fromEnglish, mergeLocaleOverrides } from "./from-english";
import { deOverrides } from "./locales/de-overrides";
import { deExtension } from "./locales/de-extension";

export const de = fromEnglish(mergeLocaleOverrides(deOverrides, deExtension));
