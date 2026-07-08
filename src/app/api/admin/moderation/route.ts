import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import {
  adminDeleteReportedContent,
  adminResolveReport,
} from "@/lib/moderation/admin-service";
import type { ReportTargetType } from "@/types/report";

export async function POST(request: NextRequest) {
  if (!isAdminSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "resolve") {
    const { reportId } = body;
    if (!reportId) {
      return NextResponse.json({ error: "reportId gerekli." }, { status: 400 });
    }
    try {
      await adminResolveReport(reportId);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Şikayet kapatılamadı." }, { status: 500 });
    }
  }

  if (action === "delete") {
    const { targetType, targetId, conversationId } = body as {
      targetType: ReportTargetType;
      targetId: string;
      conversationId?: string;
    };

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "targetType ve targetId gerekli." }, { status: 400 });
    }

    if (targetType === "user") {
      return NextResponse.json(
        { error: "Kullanıcı silme admin panelinden desteklenmiyor." },
        { status: 400 }
      );
    }

    try {
      if (targetType === "conversation") {
        if (!conversationId) {
          return NextResponse.json({ error: "conversationId gerekli." }, { status: 400 });
        }
        await adminDeleteReportedContent("conversation", targetId, conversationId);
      } else {
        await adminDeleteReportedContent(targetType, targetId);
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error && err.message === "not_found" ? "İçerik bulunamadı." : "Silinemedi.";
      return NextResponse.json({ error: message }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
}
