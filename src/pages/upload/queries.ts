import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api-client";

const uploadQueryKeys = {
  upload: () => ["upload"],
} as const;

type UploadOptions = {
  bitrate: string;
  sampleRate: string;
  channels: string;
  bitDepth: string;
  metadata: string;
  gain: number;
  normalizePeak: number;
  enableNormalizePeak: boolean;
  enableTrim: boolean;
  startTime: string;
  endTime: string;
  useCustomStart: boolean;
  useCustomEnd: boolean;
};

type UploadPayload = {
  file: File;
  outputFormat: string;
  quality: string;
  options: UploadOptions;
};

const uploadMutationOptions = (onError?: () => void) =>
  mutationOptions({
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
      formData.append("options", JSON.stringify(options));

      const [data, error] = await apiRequest<unknown>({
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
    onError: () => {
      toast.error("Upload failed. Please try again.");
      onError?.();
    },
  });

export { uploadMutationOptions };
