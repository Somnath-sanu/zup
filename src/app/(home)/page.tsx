"use client";

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/logo.svg"
              alt="Zup"
              width={60}
              height={60}
              className="hidden md:block drop-shadow-md"
            />
            <h1 className="text-3xl md:text-6xl font-bold text-center text-white dark:text-white dark:bg-none drop-shadow-sm dark:drop-shadow-lg tracking-tight pb-2">
              Build anything with Zup
            </h1>
            <p className="text-lg md:text-2xl text-white dark:text-white/90 text-center font-medium max-w-2xl">
              Bring your ideas to life with Zup
            </p>
          </div>

          <div className="max-w-3xl mx-auto w-full p-2">
            <ProjectForm />
          </div>
        </div>
      </section>
      <ProjectsList />
    </div>
  );
}
