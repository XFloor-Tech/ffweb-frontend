import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ALERT_TEXT } from "@/constants/alert";
import { API_ENDPOINTS } from "@/constants/api";
import { TaskStatus as TaskStatusMap } from "@/constants/file-constants";
import { apiRequest } from "@/lib/api-client";
import {
  parseFilenameFromContentDisposition,
  useDownloadBlob,
} from "@/lib/download";

import { useFileStore } from "@/store/file-store";
import type { ConversionSettings } from "@/types/conversion-types";
import type { TaskStatus } from "@/types/file-types";
import { appendFfmpegGoOptionsToFormData } from "./ffmpeg-options";
import type { TaskStatusResponse } from "./types";

const uploadQueryKeys = {
  upload: () => ["upload"],
  taskStatus: () => ["taskStatus"],
  download: () => ["download"],
} as const;

type UploadResponse = {
  task_id: string;
  status: TaskStatus;
};

type UploadPayload = {
  file: File;
  outputFormat: string;
  quality: string;
  options: ConversionSettings;
};

const useUploadMutation = () => {
  const {
    setTaskId,
    setTaskStatus,
    setTaskProgress,
    setIsTaskCompleted,
    setSseAttempt,
    setSelectedFile,
  } = useFileStore();

  return useMutation({
    mutationKey: uploadQueryKeys.upload(),
    mutationFn: async ({
      file,
      outputFormat,
      quality,
      options,
    }: UploadPayload) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("output_format", outputFormat);
      formData.append("quality", quality);
      appendFfmpegGoOptionsToFormData(formData, options);

      const [data, error] = await apiRequest<UploadResponse>({
        method: "POST",
        url: API_ENDPOINTS.upload,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Missing upload response data");
      }

      return data;
    },
    onSuccess: ({ task_id, status }) => {
      setTaskId(task_id);
      setTaskStatus(status);
      setTaskProgress(0);
      setIsTaskCompleted(false);
      setSseAttempt(0);
    },
    onError: () => {
      toast.error(ALERT_TEXT.fileUpload.uploadFailedToast);
      setSelectedFile(null);
    },
  });
};

const getTaskStatus = async (taskId: string) => {
  const [data, error] = await apiRequest<TaskStatusResponse>({
    method: "GET",
    url: API_ENDPOINTS.taskStatus(taskId),
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Missing task status response data");
  }

  return data;
};

const useGetTaskStatusMutation = () => {
  const {
    setTaskStatus,
    setTaskProgress,
    setIsTaskCompleted,
    incrementSseAttempt,
  } = useFileStore();

  return useMutation({
    mutationKey: uploadQueryKeys.taskStatus(),
    mutationFn: (taskId: string) => getTaskStatus(taskId),
    onError: () => {
      setTaskStatus(TaskStatusMap.Error);
      toast.error(ALERT_TEXT.fileUpload.taskStatusFailedToast);
    },
    onSuccess: (task) => {
      setTaskStatus(task.status);

      if (typeof task.progress === "number") {
        setTaskProgress(Math.min(100, Math.max(0, Math.floor(task.progress))));
      }

      if (task.status === TaskStatusMap.Completed) {
        setIsTaskCompleted(true);
        return;
      }

      if (
        task.status === TaskStatusMap.Processing ||
        task.status === TaskStatusMap.Pending
      ) {
        incrementSseAttempt();
      }
    },
  });
};
type DownloadPayload = {
  taskId: string;
};

const useDownloadMutation = () => {
  const downloadBlob = useDownloadBlob();

  return useMutation({
    mutationKey: uploadQueryKeys.download(),
    mutationFn: async ({ taskId }: DownloadPayload) => {
      const [data, error, headers] = await apiRequest<Blob>({
        url: API_ENDPOINTS.download(taskId),
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
        },
        responseType: "blob",
      });

      if (error || !data || !headers) {
        throw new Error(`Download failed: ${taskId}`);
      }

      const disposition = headers["content-disposition"];

      const filename =
        parseFilenameFromContentDisposition(disposition) ??
        `converted-${taskId}`;

      downloadBlob(data, filename);
    },
    onError: () => {
      toast.error(ALERT_TEXT.fileUpload.downloadFailedToast);
    },
  });
};
export {
  getTaskStatus,
  useDownloadMutation,
  useGetTaskStatusMutation,
  useUploadMutation,
};
