"use client";

import { useState } from "react";
import { Project } from "@/lib/actions/projects";
import { ProjectList } from "./ProjectList";

interface ProjectListWrapperProps {
  initialProjects: Project[];
}

export function ProjectListWrapper({
  initialProjects,
}: ProjectListWrapperProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjects[0]?.id || null
  );
  const [projects, setProjects] = useState(initialProjects);

  const handleProjectCreated = () => {
    // The data will be revalidated by the server action
    // For now, just refresh projects
    window.location.reload();
  };

  return (
    <ProjectList
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelectProject={setSelectedProjectId}
      onProjectCreated={handleProjectCreated}
    />
  );
}
