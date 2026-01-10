import type { FC } from "react";

type Props = {};

const FileUpload: FC<Props> = () => {
  return (
    <div className="h-full w-full rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      Upload drag and drop
    </div>
  );
};

export { FileUpload };
