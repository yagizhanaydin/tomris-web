import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRepSession } from "@/lib/auth/session";
import { readLocalPhoto } from "@/lib/verification/local-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!isRepSession(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { uid } = await params;

  if (!/^[a-zA-Z0-9_-]{10,128}$/.test(uid)) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const photo = await readLocalPhoto(uid);
  if (!photo) {
    return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store, no-cache",
    },
  });
}
