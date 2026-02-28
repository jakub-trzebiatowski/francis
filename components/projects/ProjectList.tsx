"use client";

import { useState, useTransition } from "react";
import { Project } from "@/lib/actions/projects";
import { ProjectItem } from "./ProjectItem";
import { AddProjectButton } from "./AddProjectButton";
import { deleteProject } from "@/lib/actions/projects";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onProjectCreated?: () => void;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onProjectCreated,
}: ProjectListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (projectId: string) => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        if (selectedProjectId === projectId) {
          onSelectProject(projects[0]?.id || "");
        }
      } catch (error) {
        alert(`Failed to delete project: ${error}`);
      }
    });
  };

  if (projects.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          No projects yet
        </p>
        <AddProjectButton onSuccess={onProjectCreated} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2 group">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onSelect={onSelectProject}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <AddProjectButton onSuccess={onProjectCreated} />
    </div>
  );
}
