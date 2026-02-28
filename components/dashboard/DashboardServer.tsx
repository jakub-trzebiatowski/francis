import { getProjects, type Project } from "@/lib/actions/projects";
import { getProjectSessions, type Session } from "@/lib/actions/sessions";
import { DashboardContent } from "./DashboardContent";

export async function DashboardServer() {
  const projects = await getProjects();

  // Get first project (or default)
  const selectedProject = projects[0];

  let sessions: Session[] = [];
  if (selectedProject) {
    sessions = await getProjectSessions(selectedProject.id);
  }

  return (
    <DashboardContent
      projects={projects}
      initialSelectedProject={selectedProject}
      initialSessions={sessions}
    />
  );
}
