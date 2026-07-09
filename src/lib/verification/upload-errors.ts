import type { TranslationDictionary } from "@/lib/i18n/types";

export const VERIFICATION_UPLOAD_ERROR_CODES = [
  "SERVER_CONFIG",
  "SERVER_FAULT",
  "PROCESS_FAILED",
  "STORAGE_FAILED",
  "NETWORK",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "RATE_LIMIT",
  "FILE_TOO_LARGE",
  "INVALID_FILE",
  "CONSENT_REQUIRED",
  "GENERIC",
] as const;

export type VerificationUploadErrorCode = (typeof VERIFICATION_UPLOAD_ERROR_CODES)[number];

type UploadErrorMessages = TranslationDictionary["verification"]["uploadErrors"];

const I18N_KEY: Record<VerificationUploadErrorCode, keyof UploadErrorMessages> = {
  SERVER_CONFIG: "serverConfig",
  SERVER_FAULT: "serverFault",
  PROCESS_FAILED: "processFailed",
  STORAGE_FAILED: "storageFailed",
  NETWORK: "network",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  RATE_LIMIT: "rateLimit",
  FILE_TOO_LARGE: "fileTooLarge",
  INVALID_FILE: "invalidFile",
  CONSENT_REQUIRED: "consentRequired",
  GENERIC: "generic",
};

export class VerificationUploadError extends Error {
  readonly code: VerificationUploadErrorCode;

  constructor(code: VerificationUploadErrorCode, message?: string) {
    super(message ?? code);
    this.name = "VerificationUploadError";
    this.code = code;
  }
}

export function isVerificationUploadErrorCode(
  value: unknown
): value is VerificationUploadErrorCode {
  return (
    typeof value === "string" &&
    (VERIFICATION_UPLOAD_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function normalizeUploadErrorCode(
  code: unknown,
  status: number
): VerificationUploadErrorCode {
  if (isVerificationUploadErrorCode(code)) return code;
  return mapHttpStatusToUploadErrorCode(status);
}

export function mapHttpStatusToUploadErrorCode(status: number): VerificationUploadErrorCode {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 429:
      return "RATE_LIMIT";
    case 400:
      return "INVALID_FILE";
    case 500:
    case 502:
    case 503:
      return "SERVER_FAULT";
    default:
      return "GENERIC";
  }
}

export function inferUploadErrorCodeFromMessage(message: string): VerificationUploadErrorCode {
  const lower = message.toLowerCase();
  if (
    lower.includes("firebase_service_account") ||
    lower.includes("service account") ||
    lower.includes("yapılandırması eksik") ||
    lower.includes("yapilandirmasi eksik")
  ) {
    return "SERVER_CONFIG";
  }
  if (lower.includes("sharp") || lower.includes("compress") || lower.includes("sıkıştır")) {
    return "PROCESS_FAILED";
  }
  if (lower.includes("firestore") || lower.includes("storage") || lower.includes("kayded")) {
    return "STORAGE_FAILED";
  }
  if (lower.includes("gizlilik onayı")) return "CONSENT_REQUIRED";
  if (lower.includes("çok büyük") || lower.includes("max 5mb")) return "FILE_TOO_LARGE";
  if (lower.includes("geçersiz dosya") || lower.includes("fotoğraf gerekli")) {
    return "INVALID_FILE";
  }
  if (lower.includes("yetkisiz")) return "UNAUTHORIZED";
  if (lower.includes("yasaklan") || lower.includes("yüklenemez")) return "FORBIDDEN";
  if (lower.includes("çok fazla istek")) return "RATE_LIMIT";
  return "SERVER_FAULT";
}

export function getVerificationUploadErrorDisplay(
  code: VerificationUploadErrorCode,
  messages: UploadErrorMessages
): { title: string; body: string; hint?: string } {
  return messages[I18N_KEY[code]] ?? messages.generic;
}
