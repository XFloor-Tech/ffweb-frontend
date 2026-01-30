import { useMutation } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/file-dropzone";
import { BasicSettings } from "@/components/settings/basic-settings";
import { Track } from "@/components/track";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { API_BASE_URL } from "@/lib/api-client";
import { streamSse } from "@/lib/sse";
import { useConversionStore } from "@/store/conversion-store";
import {
  BUTTON_LABELS,
  DEFAULT_PROGRESS_LABEL,
  PROGRESS_LABEL_BY_TASK_STATUS,
  TaskStatus,
  TOAST_MESSAGES,
  TrackStatus,
} from "./constants";
import {
  downloadMutationOptions,
  getTaskStatus,
  uploadMutationOptions,
} from "./queries";
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [sseAttempt, setSseAttempt] = useState(0);

  const { mutate: upload, isPending: isUploading } = useMutation(
    uploadMutationOptions({
      onError: () => setSelectedFile(null),
      onSuccess: ({ task_id, status }) => {
        setTaskId(task_id);
        setTaskStatus(status);
        setTaskProgress(0);
        setIsTaskCompleted(false);
        setSseAttempt(0);
      },
    }),
  );
  const { mutate: download, isPending: isDownloading } = useMutation(
    downloadMutationOptions(),
  );

  const conversionSettings = useConversionStore();

  const outputFormat = conversionSettings.codec.toLowerCase();
  const quality = getQualityFromBitrate(conversionSettings.bitrate);

  const resetFlow = () => {
    setSelectedFile(null);
    setTaskId(null);
    setTaskStatus(null);
    setTaskProgress(0);
    setIsTaskCompleted(false);
    setIsRetrying(false);
    setSseAttempt(0);
    conversionSettings.resetToDefaults();
  };

  useEffect(() => {
    if (!taskId || isTaskCompleted) return;

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

            if (
              maybeStatus === TaskStatus.Completed ||
              maybeStatus === TaskStatus.Cancelled ||
              maybeStatus === TaskStatus.Failed ||
              maybeStatus === TaskStatus.Error
            ) {
              controller.abort();
            }
          },
        });
      } catch {
        if (controller.signal.aborted) return;
        setTaskStatus(TaskStatus.Error);
      }
    };

    run();

    return () => controller.abort();
  }, [isTaskCompleted, sseAttempt, taskId]);

  useEffect(() => {
    if (!taskId || taskStatus !== TaskStatus.Completed || isTaskCompleted)
      return;

    const run = async () => {
      try {
        const task = await getTaskStatus(taskId);
        if (task.status === TaskStatus.Completed) {
          setIsTaskCompleted(true);
          return;
        }

        setTaskStatus(task.status);
      } catch {
        setTaskStatus(TaskStatus.Error);
      }
    };

    run();
  }, [isTaskCompleted, taskId, taskStatus]);

  const handleRetry = async () => {
    if (!taskId) {
      toast.error(TOAST_MESSAGES.noTaskSelected);
      return;
    }

    setIsRetrying(true);
    try {
      const task = await getTaskStatus(taskId);
      setTaskStatus(task.status);

      if (typeof task.progress === "number") {
        setTaskProgress(Math.min(100, Math.max(0, Math.floor(task.progress))));
      }

      if (task.status === TaskStatus.Completed) {
        setIsTaskCompleted(true);
        return;
      }

      if (
        task.status === TaskStatus.Processing ||
        task.status === TaskStatus.Pending
      ) {
        setSseAttempt((value) => value + 1);
        return;
      }
    } catch {
      setTaskStatus(TaskStatus.Error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setIsPreparing(true);
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
    setIsRetrying(false);
    setSseAttempt(0);
    upload({
      file: selectedFile,
      outputFormat,
      quality,
      options: conversionSettings,
    });
  };

  const trackData = selectedFile
    ? {
        name: selectedFile.name,
        codec: getFileFormat(selectedFile),
        convertedCodec: outputFormat,
        size: formatFileSize(selectedFile.size),
      }
    : null;

  const content = (() => {
    if (!isUploading && !isPreparing && !selectedFile) {
      return null;
    }

    const trackStatus =
      taskStatus === TaskStatus.Error || taskStatus === TaskStatus.Failed
        ? TrackStatus.Error
        : isTaskCompleted
          ? TrackStatus.Done
          : taskId
            ? TrackStatus.Converting
            : undefined;
    const showProgress =
      !!taskId &&
      taskStatus !== TaskStatus.Error &&
      taskStatus !== TaskStatus.Failed &&
      taskStatus !== TaskStatus.Cancelled &&
      !isTaskCompleted;
    const progressLabel = isTaskCompleted
      ? (PROGRESS_LABEL_BY_TASK_STATUS[TaskStatus.Completed] ??
        DEFAULT_PROGRESS_LABEL)
      : taskStatus === TaskStatus.Cancelled
        ? (PROGRESS_LABEL_BY_TASK_STATUS[TaskStatus.Cancelled] ??
          DEFAULT_PROGRESS_LABEL)
        : taskStatus === TaskStatus.Failed
          ? (PROGRESS_LABEL_BY_TASK_STATUS[TaskStatus.Failed] ??
            DEFAULT_PROGRESS_LABEL)
          : DEFAULT_PROGRESS_LABEL;

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
    <div className="flex h-full min-h-screen w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <span className="text-h4 text-gray-50">File To Convert</span>

      <FileDropzone
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        disabled={isUploading || isPreparing}
      >
        {content}
      </FileDropzone>
      <div className="flex items-center justify-end gap-2">
        <div className="xl:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="secondary">
                <Settings className="size-4" />
                Settings
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-screen overflow-auto">
              <BasicSettings />
            </DialogContent>
          </Dialog>
        </div>
        {isTaskCompleted && taskId ? (
          <>
            <Button
              disabled={isDownloading}
              onClick={() => download({ taskId })}
              variant="secondary"
            >
              {isDownloading
                ? BUTTON_LABELS.downloading
                : BUTTON_LABELS.download}
            </Button>
            <Button onClick={resetFlow}>{BUTTON_LABELS.convertMore}</Button>
          </>
        ) : taskStatus === TaskStatus.Error ||
          taskStatus === TaskStatus.Failed ||
          taskStatus === TaskStatus.Cancelled ? (
          <>
            <Button
              disabled={isRetrying}
              onClick={handleRetry}
              variant="secondary"
            >
              {isRetrying ? BUTTON_LABELS.retrying : BUTTON_LABELS.retry}
            </Button>
            <Button onClick={resetFlow}>{BUTTON_LABELS.convertMore}</Button>
          </>
        ) : (
          <Button
            disabled={!selectedFile || isUploading || !!taskId}
            onClick={handleConvert}
          >
            {BUTTON_LABELS.convert}
          </Button>
        )}
      </div>
    </div>
  );
};

export { FileUpload };
