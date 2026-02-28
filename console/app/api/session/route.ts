import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";
import { SESSION_COOKIE, SESSION_EXPIRY_MS } from "@/lib/firebase/session";

// POST /api/session
// Body: { idToken: string }
// Exchanges a Firebase ID token for a server-side session cookie.
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  try {
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRY_MS / 1000,
    });
    return response;
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE /api/session
// Clears the session cookie (logout).
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
