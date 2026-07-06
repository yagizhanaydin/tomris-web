import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { isEmailBanned } from "@/lib/ban/service";

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ banned: false });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
  }

  const banned = await isEmailBanned(email);
  return NextResponse.json({ banned });
}
