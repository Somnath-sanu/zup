"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface RenameDialogProps {
  projectId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RenameDialog = ({
  projectId,
  currentName,
  open,
  onOpenChange,
}: RenameDialogProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState(currentName);

  const renameMutation = useMutation(
    trpc.projects.rename.mutationOptions({
      onSuccess: () => {
        toast.success("Project renamed successfully");
        queryClient.invalidateQueries(
          trpc.projects.getOne.queryOptions({ id: projectId })
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to rename project");
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (name === currentName) {
      onOpenChange(false);
      return;
    }

    await renameMutation.mutateAsync({
      projectId,
      name: name.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="mt-2"
              autoFocus
              disabled={renameMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={renameMutation.isPending}>
              {renameMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
