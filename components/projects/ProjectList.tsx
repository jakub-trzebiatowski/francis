"use client";

import { Project } from "@/lib/actions/projects";
import { ProjectItem } from "./ProjectItem";
import { AddProjectButton } from "./AddProjectButton";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onDelete: (projectId: string) => void;
  onProjectCreated?: (project: Project) => void;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onDelete,
  onProjectCreated,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          No projects yet
        </p>
        <AddProjectButton onSuccess={onProjectCreated} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 group">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onDelete={onDelete}
          />
        ))}
      </div>
      <AddProjectButton onSuccess={onProjectCreated} />
    </div>
  );
}
