"use client";

import { useTransition } from "react";
import { Session } from "@/lib/actions/sessions";
import { SessionItem } from "./SessionItem";
import { AddSessionButton } from "./AddSessionButton";
import { deleteSession } from "@/lib/actions/sessions";

interface SessionListProps {
  sessions: Session[];
  projectId: string;
  onSessionCreated?: () => void;
}

export function SessionList({
  sessions,
  projectId,
  onSessionCreated,
}: SessionListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (sessionId: string) => {
    startTransition(async () => {
      try {
        await deleteSession(sessionId);
        onSessionCreated?.();
      } catch (error) {
        alert(`Failed to delete session: ${error}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Sessions</h3>
        <AddSessionButton projectId={projectId} onSuccess={onSessionCreated} />
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No sessions yet. Create your first one!
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
