import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "tomris_admin_session";
export const REP_COOKIE = "tomris_rep_session";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!s || s.length < 32)) {
    return "";
  }
  return s || "tomris-dev-only-change-me";
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

async function verifySignedToken(
  token: string | undefined
): Promise<{ role: string; username?: string } | null> {
  if (!secret()) return null;
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const parts = payload.split(":");

  let role: string;
  let username: string | undefined;
  let expiresAt: number;

  if (parts[0] === "rep" && parts.length === 3) {
    role = "rep";
    username = parts[1];
    expiresAt = Number(parts[2]);
  } else if (parts.length === 2) {
    role = parts[0];
    expiresAt = Number(parts[1]);
  } else {
    return null;
  }

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  const expected = await hmacHex(payload);
  if (sig !== expected) return null;

  return { role, username };
}

export async function isAdminSessionEdge(request: NextRequest): Promise<boolean> {
  const parsed = await verifySignedToken(request.cookies.get(ADMIN_COOKIE)?.value);
  return parsed?.role === "admin";
}

export async function isRepSessionEdge(request: NextRequest): Promise<boolean> {
  const parsed = await verifySignedToken(request.cookies.get(REP_COOKIE)?.value);
  return parsed?.role === "rep";
}
