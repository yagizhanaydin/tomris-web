import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession, getRepUsernameFromSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import {
  approveVerification,
  rejectVerification,
} from "@/lib/verification/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; action: string }> }
) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_JSON yapılandırılmamış." },
      { status: 500 }
    );
  }

  const { uid, action } = await params;
  const repUsername = getRepUsernameFromSession(request) ?? "temsilci";

  try {
    if (action === "approve") {
      await approveVerification(uid, repUsername);
    } else if (action === "reject") {
      await rejectVerification(uid, repUsername);
    } else {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "already_reviewed") {
      return NextResponse.json({ error: "Bu kayıt zaten incelenmiş." }, { status: 409 });
    }
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
