import { NextRequest } from "next/server";

export const ADMIN_COOKIE = "tomris_admin_session";
export const REP_COOKIE = "tomris_rep_session";

export function isAdminSession(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_COOKIE)?.value === "authenticated";
}

export function isRepSession(request: NextRequest): boolean {
  return request.cookies.get(REP_COOKIE)?.value === "authenticated";
}
