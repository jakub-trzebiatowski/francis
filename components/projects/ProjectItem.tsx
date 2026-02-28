"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Project } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectItem({
  project,
  isSelected,
  onSelect,
  onDelete,
}: ProjectItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete project "${project.name}"?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(project.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(project.id)}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground"
      }`}
    >
      <span className="truncate text-sm font-medium flex-1">{project.name}</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
