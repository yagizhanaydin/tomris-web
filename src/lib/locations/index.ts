import type { Locale } from "@/lib/i18n/types";
import type { Post, PostRegion } from "@/types/post";
import { CITIES_TR, getDistricts } from "./turkey";
import { EU_COUNTRY_LIST, getEuCities, COUNTRY_EN } from "./europe";

export const TR_COUNTRY = "Türkiye";

export { CITIES_TR, getDistricts, EU_COUNTRY_LIST, getEuCities };

export function getCountryLabel(country: string, locale: Locale): string {
  if (locale === "en" && COUNTRY_EN[country]) return COUNTRY_EN[country];
  return country;
}

/** Eski gönderiler için varsayılan */
export function normalizePostRegion(post: Post): PostRegion {
  if (post.region) return post.region;
  return post.country && post.country !== TR_COUNTRY ? "eu" : "tr";
}

export function normalizePostCountry(post: Post): string {
  if (post.country) return post.country;
  return normalizePostRegion(post) === "eu" ? "" : TR_COUNTRY;
}

export function formatPostLocation(post: Post, locale: Locale): string {
  const region = normalizePostRegion(post);
  const country = normalizePostCountry(post) || TR_COUNTRY;
  const countryLabel = getCountryLabel(country, locale);

  if (region === "eu") {
    return `${countryLabel} · ${post.city}`;
  }

  if (post.district) {
    return `${post.city} · ${post.district}`;
  }
  return `${countryLabel} · ${post.city}`;
}

export function getAllFilterCities(region: PostRegion | "", country: string): string[] {
  if (region === "eu" && country) return getEuCities(country);
  if (region === "tr" || region === "") return [...CITIES_TR];
  if (region === "eu") {
    return EU_COUNTRY_LIST.flatMap((c) => getEuCities(c));
  }
  return [...CITIES_TR];
}
