"use client";

import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  if (!user) return null;

  return (
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
            <div className="h-full p-6 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/40 border border-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group-hover:bg-white/10 dark:group-hover:bg-black/50">
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
  );
};
