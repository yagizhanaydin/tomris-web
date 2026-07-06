import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "tomris_admin_session";
export const REP_COOKIE = "tomris_rep_session";

function secret(): string {
  return process.env.SESSION_SECRET || "tomris-dev-only-change-me";
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

async function verifyToken(token: string | undefined, role: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const [tokenRole, expStr] = payload.split(":");
  if (tokenRole !== role) return false;

  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = await hmacHex(payload);
  return sig === expected;
}

export async function isAdminSessionEdge(request: NextRequest): Promise<boolean> {
  return verifyToken(request.cookies.get(ADMIN_COOKIE)?.value, "admin");
}

export async function isRepSessionEdge(request: NextRequest): Promise<boolean> {
  return verifyToken(request.cookies.get(REP_COOKIE)?.value, "rep");
}
