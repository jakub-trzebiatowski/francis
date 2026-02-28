// Server-side Firebase Admin SDK singletons.
// Import this in Server Components, Server Actions, Route Handlers, and
// proxy. Never import in Client Components.

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // In Cloud Run the attached service account is used automatically via
  // Application Default Credentials (ADC) — no key file needed.
  // For local development, set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
  // in .env.local to use a service account key instead.
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Newlines in the env var are escaped as \n — unescape them here.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  // ADC path: used in Cloud Run (no key vars set).
  return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
