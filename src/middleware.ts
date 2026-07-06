import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "tomris_admin_session";
const REP_COOKIE = "tomris_rep_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    const session = request.cookies.get(ADMIN_COOKIE);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin/giris", request.url));
    }
  }

  if (pathname.startsWith("/temsilci") && pathname !== "/temsilci/giris") {
    const session = request.cookies.get(REP_COOKIE);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/temsilci/giris", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/temsilci/:path*"],
};
