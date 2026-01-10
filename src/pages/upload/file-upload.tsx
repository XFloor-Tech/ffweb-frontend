import type { FC } from "react";
import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import { Track } from "@/components/track";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileFormat } from "./utils";

type Props = {};

const FileUpload: FC<Props> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const trackData = selectedFile
    ? {
        name: selectedFile.name,
        codec: getFileFormat(selectedFile),
        size: formatFileSize(selectedFile.size),
      }
    : null;

  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <FileDropzone onFileSelect={setSelectedFile}>
        {trackData && <Track data={trackData} />}
      </FileDropzone>

      <Button className="self-end" disabled={!selectedFile}>
        Convert
      </Button>
    </div>
  );
};

export { FileUpload };
