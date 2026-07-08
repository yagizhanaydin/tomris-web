import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { deactivateRep } from "@/lib/reps/service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  if (!isAdminSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const { username } = await params;
  const ok = await deactivateRep(username);
  if (!ok) {
    return NextResponse.json({ error: "Temsilci bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
