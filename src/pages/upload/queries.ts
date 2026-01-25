import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api-client";
import {
  downloadBlob,
  parseFilenameFromContentDisposition,
} from "@/lib/download";

import { appendFfmpegGoOptionsToFormData, type UploadOptions } from "./ffmpeg-options";

const uploadQueryKeys = {
  upload: () => ["upload"],
  taskStatus: (taskId: string) => ["taskStatus", taskId],
  download: (taskId: string) => ["download", taskId],
} as const;

type UploadResponse = {
  task_id: string;
  status: string;
};

type TaskStatusResponse = {
  id: string;
  input_file_path: string;
  output_file_path: string;
  status: string;
  progress: number;
  error: string;
  created_at: string;
  updated_at: string;
};

type UploadPayload = {
  file: File;
  outputFormat: string;
  quality: string;
  options: UploadOptions;
};

type UploadMutationCallbacks = {
  onError?: () => void;
  onSuccess?: (data: UploadResponse) => void;
};

const uploadMutationOptions = (callbacks?: UploadMutationCallbacks) =>
  mutationOptions({
    mutationKey: uploadQueryKeys.upload(),
    mutationFn: async ({ file, outputFormat, quality, options }: UploadPayload) => {
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
    onSuccess: (data) => {
      callbacks?.onSuccess?.(data);
    },
    onError: () => {
      toast.error("Upload failed. Please try again.");
      callbacks?.onError?.();
    },
  });

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
    mutationKey: ["download"],
    mutationFn: async ({ taskId }: DownloadPayload) => {
      // const response = await fetch(`${API_BASE_URL}/api/download/${taskId}`);
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

export { downloadMutationOptions, getTaskStatus, uploadMutationOptions };
