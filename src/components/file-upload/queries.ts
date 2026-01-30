import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api-client";
import {
  downloadBlob,
  parseFilenameFromContentDisposition,
} from "@/lib/download";

import { useFileStore } from "@/store/file-store";
import type { ConversionSettings } from "@/types/conversion-types";
import { appendFfmpegGoOptionsToFormData } from "./ffmpeg-options";
import type { TaskStatusResponse } from "./types";

const uploadQueryKeys = {
  upload: () => ["upload"],
  taskStatus: (taskId: string) => ["taskStatus", taskId],
  download: () => ["download"],
} as const;

type UploadResponse = {
  task_id: string;
  status: string;
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
        url: "/api/upload",
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
      toast.error("Upload failed. Please try again.");
      setSelectedFile(null);
    },
  });
};

const getTaskStatus = async (taskId: string) => {
  const [data, error] = await apiRequest<TaskStatusResponse>({
    method: "GET",
    url: `/api/task/${taskId}`,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Missing task status response data");
  }

  return data;
};

type DownloadPayload = {
  taskId: string;
};

const downloadMutationOptions = () =>
  mutationOptions({
    mutationKey: uploadQueryKeys.download(),
    mutationFn: async ({ taskId }: DownloadPayload) => {
      const [data, error, headers] = await apiRequest<Blob>({
        url: `/api/download/${taskId}`,
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
      toast.error("Download failed. Please try again.");
    },
  });

export { downloadMutationOptions, getTaskStatus, useUploadMutation };
