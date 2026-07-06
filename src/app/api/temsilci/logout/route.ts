import { NextResponse } from "next/server";

const REP_COOKIE = "tomris_rep_session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(REP_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
