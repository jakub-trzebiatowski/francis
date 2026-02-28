"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Session = {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
};

// Get all sessions for a project
export async function getProjectSessions(
  projectId: string
): Promise<Session[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return (sessions as Session[]) || [];
}

// Create a new session
export async function createSession(
  projectId: string,
  name: string
): Promise<Session> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert([{ project_id: projectId, name }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected");
  return session as Session;
}

// Delete a session
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected");
}
