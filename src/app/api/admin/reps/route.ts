import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase-admin";
import { listReps, createRep } from "@/lib/reps/service";

export async function GET(request: NextRequest) {
  if (!isAdminSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  try {
    const reps = await listReps();
    return NextResponse.json({ reps });
  } catch {
    return NextResponse.json({ error: "Liste alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 500 });
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
  }

  const result = await createRep(username, password, "admin");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
