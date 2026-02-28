"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Session } from "@/lib/actions/sessions";

interface SessionItemProps {
  session: Session;
  onDelete: (sessionId: string) => void;
}

export function SessionItem({ session, onDelete }: SessionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete session "${session.name}"?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(session.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors group">
      <span className="truncate text-sm font-medium flex-1">{session.name}</span>
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
