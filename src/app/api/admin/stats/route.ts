import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { getAdminStats } from "@/lib/moderation/admin-service";

export async function GET(request: NextRequest) {
  if (!isAdminSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: "İstatistikler alınamadı." }, { status: 500 });
  }
}
