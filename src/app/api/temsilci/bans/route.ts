import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { listPlatformBans } from "@/lib/ban/service";

export async function GET(request: NextRequest) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_JSON yapılandırılmamış." },
      { status: 500 }
    );
  }

  const bans = await listPlatformBans(30);
  return NextResponse.json({ bans });
}
