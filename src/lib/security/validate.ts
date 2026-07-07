import { assertSafeContent, ContentBlockedError } from "./content-filter";
import {
  isValidUsernameChars,
  normalizeUsername,
} from "./username";

export { ContentBlockedError, isSafeContent } from "./content-filter";
export { normalizeUsername, isValidUsernameChars } from "./username";

export function validateUsername(username: string): boolean {
  if (!isValidUsernameChars(username)) return false;
  try {
    assertSafeContent(username);
    return true;
  } catch {
    return false;
  }
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
