"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

// Get all projects for the current user
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return (projects as Project[]) || [];
}

// Get a single project
export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return (project as Project) || null;
}

// Create a new project
export async function createProject(name: string): Promise<Project> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected", "layout");
  return project as Project;
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected", "layout");
}

// Update project name
export async function updateProject(
  projectId: string,
  name: string
): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected", "layout");
  return project as Project;
}
