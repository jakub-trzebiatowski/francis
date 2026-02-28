// Shared session helpers used by middleware and Server Components/Actions.
// Reads the __session httpOnly cookie, verifies it with the Admin SDK, and
// returns the decoded token (or null if missing/invalid).

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";
import type { DecodedIdToken } from "firebase-admin/auth";

export const SESSION_COOKIE = "__session";
// 14 days — Firebase session cookies can be issued for up to 2 weeks.
export const SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000;

export async function getSession(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  try {
    return await adminAuth().verifySessionCookie(cookie.value, true);
  } catch {
    return null;
  }
}
