import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { resolveReport } from "@/lib/reports/admin";

type RouteContext = { params: Promise<{ reportId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const { reportId } = await context.params;

  try {
    await resolveReport(reportId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
