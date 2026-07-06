import { assertSafeContent, ContentBlockedError } from "./content-filter";

export { ContentBlockedError, isSafeContent } from "./content-filter";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateUsername(username: string): boolean {
  if (!USERNAME_REGEX.test(username.trim())) return false;
  try {
    assertSafeContent(username);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function sanitizeText(input: string, maxLength = 500): string {
  const cleaned = input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
  assertSafeContent(cleaned);
  return cleaned;
}
