import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, REP_COOKIE } from "@/lib/auth/session-edge";

export { ADMIN_COOKIE, REP_COOKIE };

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET ortam değişkeni production için zorunludur.");
  }
  return "tomris-dev-only-change-me";
}

function signPayload(payload: string): string {
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifySignedToken(token: string | undefined): { role: string; username?: string } | null {
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

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }

  return { role, username };
}

export function createAdminSessionToken(): string {
  return signPayload(`admin:${Date.now() + SESSION_TTL_MS}`);
}

export function createRepSessionToken(username: string): string {
  return signPayload(`rep:${username}:${Date.now() + SESSION_TTL_MS}`);
}

export function isAdminSession(request: {
  cookies: { get: (n: string) => { value?: string } | undefined };
}): boolean {
  const parsed = verifySignedToken(request.cookies.get(ADMIN_COOKIE)?.value);
  return parsed?.role === "admin";
}

export function isRepSession(request: {
  cookies: { get: (n: string) => { value?: string } | undefined };
}): boolean {
  const parsed = verifySignedToken(request.cookies.get(REP_COOKIE)?.value);
  return parsed?.role === "rep";
}

export function getRepUsernameFromSession(request: {
  cookies: { get: (n: string) => { value?: string } | undefined };
}): string | null {
  const parsed = verifySignedToken(request.cookies.get(REP_COOKIE)?.value);
  if (parsed?.role !== "rep") return null;
  return parsed.username ?? process.env.REP_USERNAME ?? "temsilci";
}

export function setAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export function setRepSessionCookie(response: NextResponse, username: string): void {
  response.cookies.set(REP_COOKIE, createRepSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}
