import type { ChangeEvent, DragEvent, FC, ReactNode } from "react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { FileDown } from "lucide-react";

type Props = {
  className?: string;
  onFileSelect?: (file: File) => void;
  children?: ReactNode;
  disabled?: boolean;
  selectedFile?: File | null;
};

const ALLOWED_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "flac",
  "aac",
  "m4a",
  "ogg",
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
]);

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

const isAllowedFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(
    extension &&
      ALLOWED_EXTENSIONS.has(extension) &&
      file.size <= MAX_FILE_SIZE_BYTES,
  );
};

const FileDropzone: FC<Props> = ({
  className,
  onFileSelect,
  children,
  disabled,
  selectedFile,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && isAllowedFile(file)) {
      onFileSelect?.(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file && isAllowedFile(file)) {
      onFileSelect?.(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "flex h-145 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 px-7 py-6 text-center text-white",
        isDragging || selectedFile ? "border-primary" : "border-gray-600",
        selectedFile ? "bg-transparent" : "border-dashed bg-gray-800",
        className,
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      {!children && (
        <>
          <input
            ref={inputRef}
            accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,.mp4,.mov,.avi,.mkv,.webm"
            className="hidden"
            type="file"
            onChange={handleChange}
            disabled={disabled}
          />
          <FileDown size={48} className="text-primary" strokeWidth={1} />
          <div className="flex flex-col justify-center gap-1">
            <span className="text-h4">Drag & Drop File Here</span>
            <span className="text-monospace">or click to select</span>
          </div>
          <span className="text-text text-gray-300">
            MP3, WAV, FLAC, AAC, M4A, OGG, MP4, MOV, AVI, MKV, WebM
          </span>
        </>
      )}

      {children}
    </div>
  );
};

export { FileDropzone };
