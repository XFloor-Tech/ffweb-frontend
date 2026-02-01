import { useEffect, type FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/file-dropzone";
import { Track } from "@/components/track";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ALERT_TEXT } from "@/constants/alert";
import { API_ENDPOINTS } from "@/constants/api";
import {
  BUTTON_LABELS,
  DEFAULT_PROGRESS_LABEL,
  PROGRESS_LABEL_BY_TASK_STATUS,
  TaskStatus,
} from "@/constants/file-constants";
import { streamSse } from "@/lib/sse";
import { useConversionStore } from "@/store/conversion-store";
import { useFileStore } from "@/store/file-store";
import type { TaskStatus as TaskStatusType } from "@/types/file-types";
import {
  getFalsyTaskStatus,
  getTrackStatusFromTaskStatus,
} from "@/utils/file-status";
import { ConversionSettings } from "../settings/conversion-settings";
import {
  downloadMutationOptions,
  useGetTaskStatusMutation,
  useUploadMutation,
} from "./queries";
import { formatFileSize, getFileFormat, getQualityFromBitrate } from "./utils";

type Props = Record<string, never>;

type TaskEvent = {
  status: TaskStatusType;
  progress?: number;
};

const FileUpload: FC<Props> = () => {
  const {
    selectedFile,
    isPreparing,
    taskId,
    taskStatus,
    taskProgress,
    isTaskCompleted,
    sseAttempt,
    setIsPreparing,
    setIsTaskCompleted,
    setSelectedFile,
    setSseAttempt,
    setTaskId,
    setTaskProgress,
    setTaskStatus,
    resetToDefaults: resetFileState,
  } = useFileStore();

  const conversionSettings = useConversionStore();

  const { mutate: upload, isPending: isUploading } = useUploadMutation();

  const { mutate: getTaskStatus, isPending: isTaskStatusPending } =
    useGetTaskStatusMutation();

  const { mutate: download, isPending: isDownloading } = useMutation(
    downloadMutationOptions(),
  );

  const outputFormat = conversionSettings.codec.toLowerCase();
  const quality = getQualityFromBitrate(conversionSettings.bitrate);

  const resetFlow = () => {
    resetFileState();
    conversionSettings.resetToDefaults();
  };

  useEffect(() => {
    if (!taskId || isTaskCompleted) return;

    const controller = new AbortController();

    const run = async () => {
      try {
        await streamSse({
          url: API_ENDPOINTS.events(taskId),
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
              getFalsyTaskStatus(maybeStatus)
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
  }, [isTaskCompleted, setTaskProgress, setTaskStatus, sseAttempt, taskId]);

  // Gets status on sse finish and based on that sets task status.
  // TODO: move to a sse finish callback logic instead of effect??
  useEffect(() => {
    if (!taskId || taskStatus !== TaskStatus.Completed || isTaskCompleted)
      return;

    getTaskStatus(taskId);
  }, [
    getTaskStatus,
    isTaskCompleted,
    setIsTaskCompleted,
    setTaskStatus,
    taskId,
    taskStatus,
  ]);

  const handleRetry = async () => {
    if (!taskId) {
      toast.error(ALERT_TEXT.fileUpload.noTaskSelectedToast);
      return;
    }

    getTaskStatus(taskId);
  };

  const handleFileSelect = (file: File) => {
    setIsPreparing(true);
    setSelectedFile(file);
    setIsPreparing(false);
  };

  const handleConvert = () => {
    if (!selectedFile) {
      return;
    }

    setTaskId(null);
    setTaskStatus(null);
    setTaskProgress(0);
    setIsTaskCompleted(false);
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

    const trackStatus = taskStatus
      ? getTrackStatusFromTaskStatus(taskStatus)
      : undefined;

    const showProgress =
      !!taskId &&
      !!taskStatus &&
      !getFalsyTaskStatus(taskStatus) &&
      !isTaskCompleted;

    const progressLabel = taskStatus
      ? PROGRESS_LABEL_BY_TASK_STATUS[taskStatus]
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
    <div className="flex h-full min-h-screen w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
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
              <ConversionSettings className="border-0" />
            </DialogContent>
          </Dialog>
        </div>

        {isTaskCompleted && taskId && (
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
        )}

        {!isTaskCompleted && getFalsyTaskStatus(taskStatus) && (
          <>
            <Button
              disabled={isTaskStatusPending}
              onClick={handleRetry}
              variant="secondary"
            >
              {isTaskStatusPending
                ? BUTTON_LABELS.retrying
                : BUTTON_LABELS.retry}
            </Button>

            <Button onClick={resetFlow} disabled={isTaskStatusPending}>
              {BUTTON_LABELS.convertMore}
            </Button>
          </>
        )}

        {!isTaskCompleted && !getFalsyTaskStatus(taskStatus) && (
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
