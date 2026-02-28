"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

export type Session = {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
};

// Get all sessions for a project
export async function getProjectSessions(
  projectId: string
): Promise<Session[]> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const snap = await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId)
    .collection("sessions")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    projectId,
    name: doc.data().name as string,
    createdAt: (doc.data().createdAt?.toDate() as Date)?.toISOString() ?? new Date().toISOString(),
  }));
}

// Create a new session
export async function createSession(
  projectId: string,
  name: string
): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const ref = await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId)
    .collection("sessions")
    .add({ name, createdAt: FieldValue.serverTimestamp() });

  revalidatePath("/protected", "layout");

  return {
    id: ref.id,
    projectId,
    name,
    createdAt: new Date().toISOString(),
  };
}

// Delete a session
export async function deleteSession(sessionId: string, projectId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId)
    .collection("sessions")
    .doc(sessionId)
    .delete();

  revalidatePath("/protected", "layout");
}
