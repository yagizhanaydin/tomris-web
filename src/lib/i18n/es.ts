import { fromEnglish, mergeLocaleOverrides } from "./from-english";
import { esOverrides } from "./locales/es-overrides";
import { esExtension } from "./locales/es-extension";

export const es = fromEnglish(mergeLocaleOverrides(esOverrides, esExtension));
