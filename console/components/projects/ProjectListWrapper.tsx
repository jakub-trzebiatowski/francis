"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Project, deleteProject } from "@/lib/actions/projects";
import { ProjectList } from "./ProjectList";

interface ProjectListWrapperProps {
  initialProjects: Project[];
}

export function ProjectListWrapper({ initialProjects }: ProjectListWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Derive selected project from URL: /protected/[projectId]
  const segments = pathname.split("/");
  const selectedProjectId =
    segments[1] === "protected" && segments[2] ? segments[2] : null;

  const handleDelete = (projectId: string) => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        if (selectedProjectId === projectId) {
          router.push("/protected");
        }
      } catch (error) {
        alert(`Failed to delete project: ${error}`);
      }
    });
  };

  const handleProjectCreated = (project: Project) => {
    router.push(`/protected/${project.id}`);
  };

  return (
    <ProjectList
      projects={initialProjects}
      selectedProjectId={selectedProjectId}
      onDelete={handleDelete}
      onProjectCreated={handleProjectCreated}
    />
  );
}
