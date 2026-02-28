import { getProjects } from "@/lib/actions/projects";
import { ProjectListWrapper } from "./ProjectListWrapper";

export async function ProjectListServer() {
  const projects = await getProjects();

  return <ProjectListWrapper initialProjects={projects} />;
}
