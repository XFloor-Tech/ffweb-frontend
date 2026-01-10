import type { FC } from "react";
import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";

type Props = {};

const FileUpload: FC<Props> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex h-full w-full flex-col items-end gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <FileDropzone onFileSelect={setSelectedFile} />
      <Button disabled={!selectedFile}>Convert</Button>
    </div>
  );
};

export { FileUpload };
