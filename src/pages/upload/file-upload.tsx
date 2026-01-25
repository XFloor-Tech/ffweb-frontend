import { useEffect, useState, type FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { FileDropzone } from "@/components/file-dropzone";
import { Track } from "@/components/track";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { API_BASE_URL } from "@/lib/api-client";
import { streamSse } from "@/lib/sse";
import { useConversionStore } from "@/stores/conversionStore";
import { downloadMutationOptions, getTaskStatus, uploadMutationOptions } from "./queries";
import { formatFileSize, getFileFormat, getQualityFromBitrate } from "./utils";

type Props = Record<string, never>;

type TaskEvent = {
  status: string;
  progress?: number;
};

const FileUpload: FC<Props> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const { mutate: upload, isPending: isUploading } = useMutation(
    uploadMutationOptions({
      onError: () => setSelectedFile(null),
      onSuccess: ({ task_id, status }) => {
        setTaskId(task_id);
        setTaskStatus(status);
        setTaskProgress(0);
        setIsTaskCompleted(false);
      },
    }),
  );
  const { mutate: download, isPending: isDownloading } = useMutation(
    downloadMutationOptions(),
  );
  const {
    bitrate,
    sampleRate,
    channels,
    bitDepth,
    metadata,
    gain,
    normalizePeak,
    enableNormalizePeak,
    enableTrim,
    startTime,
    endTime,
    useCustomStart,
    useCustomEnd,
    codec,
  } = useConversionStore();
  const outputFormat = codec.toLowerCase();
  const quality = getQualityFromBitrate(bitrate);

  useEffect(() => {
    if (!taskId) return;

    const controller = new AbortController();
    const url = `${API_BASE_URL}/api/events/${taskId}`;

    const run = async () => {
      try {
        await streamSse({
          url,
          signal: controller.signal,
          onEvent: ({ data }) => {
            let parsed: unknown;
            try {
              parsed = JSON.parse(data);
            } catch {
              return;
            }

            if (!parsed || typeof parsed !== "object") return;

            const maybeStatus = (parsed as TaskEvent).status;
            const maybeProgress = (parsed as TaskEvent).progress;

            if (typeof maybeStatus === "string") {
              setTaskStatus(maybeStatus);
            }

            if (typeof maybeProgress === "number") {
              const normalizedProgress = Math.min(
                100,
                Math.max(0, Math.floor(maybeProgress)),
              );
              setTaskProgress(normalizedProgress);
            }

            if (maybeStatus === "completed" || maybeStatus === "cancelled") {
              controller.abort();
            }
          },
        });
      } catch {
        if (controller.signal.aborted) return;
        setTaskStatus("error");
      }
    };

    run();

    return () => controller.abort();
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    if (taskStatus !== "completed") return;
    if (isTaskCompleted) return;

    const run = async () => {
      try {
        const task = await getTaskStatus(taskId);
        if (task.status === "completed") {
          setIsTaskCompleted(true);
          return;
        }

        setTaskStatus(task.status);
      } catch {
        setTaskStatus("error");
      }
    };

    run();
  }, [isTaskCompleted, taskId, taskStatus]);

  const handleFileSelect = (file: File) => {
    setIsPreparing(true);
    setTaskId(null);
    setTaskStatus(null);
    setTaskProgress(0);
    setIsTaskCompleted(false);
    setSelectedFile(file);
    requestAnimationFrame(() => setIsPreparing(false));
  };

  const handleConvert = () => {
    if (!selectedFile) {
      return;
    }

    setTaskId(null);
    setTaskStatus(null);
    setTaskProgress(0);
    setIsTaskCompleted(false);
    upload({
      file: selectedFile,
      outputFormat,
      quality,
      options: {
        bitrate,
        sampleRate,
        channels,
        bitDepth,
        metadata,
        gain,
        normalizePeak,
        enableNormalizePeak,
        enableTrim,
        startTime,
        endTime,
        useCustomStart,
        useCustomEnd,
      },
    });
  };

  const trackData = selectedFile
    ? {
        name: selectedFile.name,
        codec: getFileFormat(selectedFile),
        size: formatFileSize(selectedFile.size),
      }
    : null;

  const content = (() => {
    if (!isUploading && !isPreparing && !selectedFile) {
      return null;
    }

    const trackStatus =
      taskStatus === "error"
        ? "error"
        : isTaskCompleted
          ? "done"
          : taskId
            ? "converting"
            : undefined;
    const showProgress = !!taskId && taskStatus !== "error" && !isTaskCompleted;
    const progressLabel =
      isTaskCompleted
        ? "Completed"
        : taskStatus === "cancelled"
          ? "Cancelled"
          : "Converting";

    return (
      <>
        {trackData ? <Track data={trackData} status={trackStatus} /> : null}
        {(isUploading || isPreparing) && <Spinner className="text-primary" />}
        {showProgress ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-gray-200">
              <span className="text-gray-400">{progressLabel}</span>
              <span>{taskProgress}%</span>
            </div>
            <Progress value={taskProgress} />
          </div>
        ) : null}
      </>
    );
  })();

  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <FileDropzone
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        disabled={isUploading || isPreparing}
      >
        {content}
      </FileDropzone>
      <div className="flex justify-end gap-2">
        {isTaskCompleted && taskId ? (
          <Button
            disabled={isDownloading}
            onClick={() => download({ taskId })}
            variant="secondary"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        ) : null}
        <Button
          disabled={!selectedFile || isUploading || !!taskId}
          onClick={handleConvert}
        >
          Convert
        </Button>
      </div>
    </div>
  );
};

export { FileUpload };
