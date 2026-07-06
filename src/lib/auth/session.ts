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

function signPayload(role: string, expiresAt: number): string {
  const payload = `${role}:${expiresAt}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined, role: string): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const [tokenRole, expStr] = payload.split(":");
  if (tokenRole !== role) return false;

  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string {
  return signPayload("admin", Date.now() + SESSION_TTL_MS);
}

export function createRepSessionToken(): string {
  return signPayload("rep", Date.now() + SESSION_TTL_MS);
}

export function isAdminSession(request: { cookies: { get: (n: string) => { value?: string } | undefined } }): boolean {
  return verifyToken(request.cookies.get(ADMIN_COOKIE)?.value, "admin");
}

export function isRepSession(request: { cookies: { get: (n: string) => { value?: string } | undefined } }): boolean {
  return verifyToken(request.cookies.get(REP_COOKIE)?.value, "rep");
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

export function setRepSessionCookie(response: NextResponse): void {
  response.cookies.set(REP_COOKIE, createRepSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}
