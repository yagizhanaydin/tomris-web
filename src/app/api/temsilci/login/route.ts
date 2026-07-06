import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REP_COOKIE = "tomris_rep_session";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const repUsername = process.env.REP_USERNAME;
  const repPassword = process.env.REP_PASSWORD;

  if (!repUsername || !repPassword) {
    return NextResponse.json(
      { error: "Temsilci yapılandırması eksik." },
      { status: 500 }
    );
  }

  if (username !== repUsername || password !== repPassword) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı adı veya şifre." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(REP_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
