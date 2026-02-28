import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";
import { SESSION_COOKIE } from "@/lib/firebase/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't need auth
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/auth/");

  const cookie = request.cookies.get(SESSION_COOKIE);

  if (!isPublic) {
    if (!cookie?.value) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    try {
      await adminAuth().verifySessionCookie(cookie.value, true);
    } catch {
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  // If already logged in and hitting auth pages, send to app
  if (isPublic && pathname.startsWith("/auth/") && cookie?.value) {
    try {
      await adminAuth().verifySessionCookie(cookie.value, true);
      return NextResponse.redirect(new URL("/protected", request.url));
    } catch {
      // Invalid cookie — let them through to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
