import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Fragment } from "@prisma/client";
import { checkForClosePort } from "../../server/check-sandbox";

interface Props {
  data: Fragment;
  projectId: string;
}

export const FragmentWeb = ({ data, projectId }: Props) => {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [sandboxIdForIFrame, setSandboxIdForIFrame] = useState(data.sandboxUrl);
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const updateFragment = useMutation(
    trpc.fragment.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({
            projectId,
          })
        );
      },
      onError: (error) => {
        if (error.data?.code === "NOT_FOUND") {
          toast.error("Fragment not found");
          return;
        }
        toast.error("Failed to restart the sandbox");
      },
    })
  );

  const createSandbox = useMutation(
    trpc.sandbox.create.mutationOptions({
      onError: (error) => {
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          setQuotaExhausted(true);
          toast.error(error.message);
        } else {
          toast.error("Failed to create new sandbox");
        }
      },
    })
  );

  const checkPortAndRestartIfNeeded = async () => {
    if (quotaExhausted) {
      return;
    }

    const isRunning = await checkForClosePort(sandboxIdForIFrame);

    if (!isRunning) {
      try {
        const newSandboxUrl = await createSandbox.mutateAsync({
          files: data.files as { [path: string]: string },
        });
        await updateFragment.mutateAsync({
          id: data.id,
          messageId: data.messageId,
          sandboxUrl: newSandboxUrl,
        });
        setSandboxIdForIFrame(newSandboxUrl);
        setFragmentKey((prev) => prev + 1); // Force iframe refresh
        toast.success("New sandbox created and port is now active");
      } catch {
        // Error handling is done in the mutation's onError
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(checkPortAndRestartIfNeeded, 1000);
    return () => clearTimeout(timeoutId);
  }, [sandboxIdForIFrame]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sandboxIdForIFrame);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom" align="start">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>

        <Hint text="Click to copy" side="bottom">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!sandboxIdForIFrame || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{sandboxIdForIFrame}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            disabled={!sandboxIdForIFrame}
            onClick={() => {
              if (!sandboxIdForIFrame) return;
              window.open(sandboxIdForIFrame, "_blank");
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={sandboxIdForIFrame}
      />
    </div>
  );
};
