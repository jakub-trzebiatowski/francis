"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Project } from "@/lib/actions/projects";

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onDelete: (projectId: string) => void;
}

export function ProjectItem({
  project,
  isSelected,
  onDelete,
}: ProjectItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Link
      href={`/protected/${project.id}`}
      className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors ${
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
    </Link>
  );
}
