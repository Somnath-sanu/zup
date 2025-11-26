"use client";

import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { DeleteDialog } from "@/modules/projects/ui/components/delete-dialog";
import { Button } from "@/components/ui/button";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (!user) return null;

  const handleDeleteClick = (
    e: React.MouseEvent,
    projectId: string,
    projectName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProject({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {selectedProject && (
        <DeleteDialog
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
      <div className="flex flex-col gap-6 w-full">
        <h2 className="text-2xl font-bold text-white drop-shadow-md">
          Recent Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.length === 0 && (
            <div className="col-span-full text-center p-8 rounded-xl backdrop-blur-[2px] bg-white/5 border border-white/10">
              <p className="text-white/80">No projects found</p>
            </div>
          )}
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block"
            >
              <div className="relative h-full p-6 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/40 border border-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group-hover:bg-white/10 dark:group-hover:bg-black/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) =>
                    handleDeleteClick(e, project.id, project.name)
                  }
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-[2px] shrink-0">
                    <Image
                      src={"/logo.svg"}
                      alt="zup"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-semibold text-white truncate text-lg group-hover:text-primary transition-colors drop-shadow-sm">
                      {project.name}
                    </h3>
                    <p className="text-white/70 text-sm mt-1 drop-shadow-sm">
                      Edited{" "}
                      {formatDistanceToNow(project.updatedAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
