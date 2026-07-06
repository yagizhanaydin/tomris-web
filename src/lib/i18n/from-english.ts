import { en } from "./en";
import type { TranslationDictionary } from "./types";

type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

function deepMerge<T extends object>(base: T, overrides: DeepPartial<T>): T {
  if (overrides === undefined || overrides === null) return base;
  if (typeof overrides !== "object") return overrides as T;
  if (Array.isArray(overrides)) return overrides as T;
  if (Array.isArray(base)) return overrides as T;

  const result = { ...base } as Record<string, unknown>;
  const source = overrides as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const overrideVal = source[key];
    if (overrideVal === undefined) continue;
    const baseVal = (base as Record<string, unknown>)[key];
    if (
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(overrideVal) &&
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as object,
        overrideVal as DeepPartial<Record<string, unknown>>
      );
    } else {
      result[key] = overrideVal;
    }
  }

  return result as T;
}

export function fromEnglish(overrides: DeepPartial<TranslationDictionary>): TranslationDictionary {
  return deepMerge(en, overrides);
}
