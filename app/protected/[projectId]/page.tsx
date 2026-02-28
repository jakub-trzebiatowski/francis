import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/actions/projects";
import { getProjectSessions } from "@/lib/actions/sessions";
import { SessionList } from "@/components/sessions/SessionList";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

async function handleSessionCreated() {
  "use server";
  // revalidation is handled inside the session actions
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { projectId } = await params;

  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    notFound();
  }

  const sessions = await getProjectSessions(projectId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Created {project.created_at.slice(0, 10)}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SessionList sessions={sessions} projectId={project.id} />
      </div>
    </div>
  );
}
