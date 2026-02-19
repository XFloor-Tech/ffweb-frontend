import type { FC } from "react";

import { AudioLines, FileType, HardDrive } from "lucide-react";

import { TrackStatus as TrackStatusMap } from "@/constants/file-constants";
import type { TrackStatus } from "@/types/file-types";
import { Badge } from "./ui/badge";

type Props = {
  data?: {
    name: string;
    codec?: string;
    convertedCodec?: string;
    size?: string;
  };
  status?: TrackStatus;
};

const Track: FC<Props> = ({ data, status }) => {
  const statusLabel =
    status === "done" ? "Done" : status === "error" ? "Error" : "Converting";

  const statusClasses =
    status === "done"
      ? "success"
      : status === "error"
        ? "destructive"
        : "pending";

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-gray-600 bg-gray-800 px-6 py-4 text-gray-50">
      <div className="flex items-center gap-3">
        <AudioLines
          strokeWidth={1}
          className="hidden size-4 text-primary sm:block sm:size-6"
        />
        <span className="max-w-16 text-start text-mini wrap-break-word sm:max-w-48 sm:text-small md:max-w-64">
          {data?.name ?? "Unnamed"}
        </span>
      </div>

      {!!status && <Badge variant={statusClasses}>{statusLabel}</Badge>}

      <div className="flex items-center gap-6">
        {!!data?.codec && status !== "done" && (
          <div className="flex flex-col items-center gap-1">
            <FileType
              className="size-4 text-primary sm:size-6"
              strokeWidth={1}
            />
            <span className="text-mini sm:text-small">{data.codec}</span>
          </div>
        )}

        {status === TrackStatusMap.Done && !!data?.convertedCodec && (
          <div className="flex flex-col items-center gap-1">
            <FileType
              className="size-4 text-emerald-400 sm:size-6"
              strokeWidth={1}
            />
            <span className="text-mini text-emerald-300 sm:text-small">
              {data.convertedCodec.toUpperCase()}
            </span>
          </div>
        )}

        {!!data?.size && (
          <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
            <HardDrive
              className="size-4 text-primary sm:size-6"
              strokeWidth={1}
            />
            <span className="text-mini text-gray-200 sm:text-small">
              {data.size}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export { Track };
