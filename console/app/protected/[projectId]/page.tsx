import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/firebase/session";
import { getProjects } from "@/lib/actions/projects";
import { getProjectSessions } from "@/lib/actions/sessions";
import { SessionList } from "@/components/sessions/SessionList";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getSession();

  if (!session) {
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
          Created {project.createdAt.slice(0, 10)}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SessionList sessions={sessions} projectId={project.id} />
      </div>
    </div>
  );
}
