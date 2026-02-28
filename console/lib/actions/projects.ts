"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

// Get all projects for the current user
export async function getProjects(): Promise<Project[]> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const snap = await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name as string,
    createdAt: (doc.data().createdAt?.toDate() as Date)?.toISOString() ?? new Date().toISOString(),
  }));
}

// Get a single project
export async function getProject(projectId: string): Promise<Project | null> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const doc = await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId)
    .get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    name: doc.data()!.name as string,
    createdAt: (doc.data()!.createdAt?.toDate() as Date)?.toISOString() ?? new Date().toISOString(),
  };
}

// Create a new project
export async function createProject(name: string): Promise<Project> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const ref = await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .add({ name, createdAt: FieldValue.serverTimestamp() });

  revalidatePath("/protected", "layout");

  return {
    id: ref.id,
    name,
    createdAt: new Date().toISOString(),
  };
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  await adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId)
    .delete();

  revalidatePath("/protected", "layout");
}

// Update project name
export async function updateProject(
  projectId: string,
  name: string
): Promise<Project> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const ref = adminDb()
    .collection("users")
    .doc(session.uid)
    .collection("projects")
    .doc(projectId);

  await ref.update({ name });

  const doc = await ref.get();
  revalidatePath("/protected", "layout");

  return {
    id: doc.id,
    name: doc.data()!.name as string,
    createdAt: (doc.data()!.createdAt?.toDate() as Date)?.toISOString() ?? new Date().toISOString(),
  };
}
