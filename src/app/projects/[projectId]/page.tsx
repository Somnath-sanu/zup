import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{
    projectId: string;
  }>;
}
const Page = async ({ params }: Props) => {
  const { projectId } = await params;

  //pre-fetching
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({
      projectId,
    })
  );
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<ProjectNotFound />}>
        <Suspense fallback={<ProjectLoading />}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

function ProjectLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-bold">Loading...</p>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-bold">Project not found</p>
    </div>
  );
}
