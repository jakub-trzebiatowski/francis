"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createSession } from "@/lib/actions/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddSessionButtonProps {
  projectId: string;
  onSuccess?: () => void;
}

export function AddSessionButton({ projectId, onSuccess }: AddSessionButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        await createSession(projectId, name);
        setName("");
        setOpen(false);
        onSuccess?.();
      } catch (error) {
        alert(`Failed to create session: ${error}`);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Session
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Session</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Session Name
              </label>
              <Input
                id="name"
                placeholder="Session 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
