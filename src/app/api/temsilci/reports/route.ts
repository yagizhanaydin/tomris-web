import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { listOpenReports } from "@/lib/reports/admin";

export async function GET(request: NextRequest) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  try {
    const reports = await listOpenReports();
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Liste alınamadı." }, { status: 500 });
  }
}
