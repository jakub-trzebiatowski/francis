"use client";

import { useState } from "react";
import { Project } from "@/lib/actions/projects";
import { Session } from "@/lib/actions/sessions";
import { SessionList } from "@/components/sessions/SessionList";

interface DashboardContentProps {
  projects: Project[];
  initialSelectedProject: Project | undefined;
  initialSessions: Session[];
}

export function DashboardContent({
  projects,
  initialSelectedProject,
  initialSessions,
}: DashboardContentProps) {
  const [selectedProject, setSelectedProject] = useState(
    initialSelectedProject
  );
  const [sessions, setSessions] = useState(initialSessions);

  const handleSessionCreated = async () => {
    if (selectedProject) {
      // Trigger a re-fetch by reloading
      window.location.reload();
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">No projects yet</h2>
          <p className="text-muted-foreground">
            Create your first project from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div>
        <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Created {selectedProject.created_at.slice(0, 10)}
        </p>
      </div>

      {/* Sessions Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <SessionList
          sessions={sessions}
          projectId={selectedProject.id}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
