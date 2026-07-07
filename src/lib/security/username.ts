/** Kullanıcı adında izin verilen karakterler — Latin + Türkçe */
export const USERNAME_CHAR_PATTERN = "a-zA-Z0-9_\\u00C7\\u00E7\\u011E\\u011F\\u0130\\u0131\\u015E\\u015F\\u00D6\\u00F6\\u00DC\\u00FC";

const USERNAME_REGEX = new RegExp(`^[${USERNAME_CHAR_PATTERN}]{3,20}$`);
const USERNAME_SEARCH_REGEX = new RegExp(`^[${USERNAME_CHAR_PATTERN}]+$`, "i");

export function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("tr-TR");
}

export function isValidUsernameChars(username: string): boolean {
  return USERNAME_REGEX.test(username.trim());
}

export function isValidUsernameSearchQuery(query: string): boolean {
  return USERNAME_SEARCH_REGEX.test(query);
}
