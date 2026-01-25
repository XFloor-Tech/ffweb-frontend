import { AudioLines, FileType, HardDrive } from "lucide-react";
import type { FC } from "react";

type Props = {
  data?: {
    name: string;
    codec?: string;
    size?: string;
  };
  status?: "converting" | "done" | "error";
};

const Track: FC<Props> = ({ data, status }) => {
  const statusLabel =
    status === "done" ? "Done" : status === "error" ? "Error" : "Converting";
  const statusClasses =
    status === "done"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : status === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  return (
    <div className="flex w-full items-center justify-between rounded-[10px] border border-gray-600 bg-gray-800 px-6 py-4 text-gray-50">
      <div className="flex items-center gap-3">
        <AudioLines size={24} strokeWidth={1} className="text-primary" />
        <span>{data?.name ?? "Unnamed"}</span>
      </div>

      <div className="flex items-center gap-6">
        {status ? (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses}`}
          >
            {statusLabel}
          </span>
        ) : null}
        {data?.codec ? (
          <div className="flex flex-col items-center gap-1">
            <FileType size={24} className="text-primary" strokeWidth={1} />
            <span>{data.codec}</span>
          </div>
        ) : null}
        {data?.size ? (
          <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
            <HardDrive size={24} className="text-primary" strokeWidth={1} />
            <span className="text-sm text-gray-200">{data.size}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export { Track };
