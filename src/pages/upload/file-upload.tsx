import { useState, type FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { FileDropzone } from "@/components/file-dropzone";
import { Track } from "@/components/track";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConversionStore } from "@/stores/conversionStore";
import { uploadMutationOptions } from "./queries";
import { formatFileSize, getFileFormat, getQualityFromBitrate } from "./utils";

type Props = {};

const FileUpload: FC<Props> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const { mutate: upload, isPending: isUploading } = useMutation(
    uploadMutationOptions(() => setSelectedFile(null)),
  );
  const {
    bitrate,
    sampleRate,
    channels,
    bitDepth,
    metadata,
    gain,
    normalizePeak,
    enableNormalizePeak,
    enableTrim,
    startTime,
    endTime,
    useCustomStart,
    useCustomEnd,
    codec,
  } = useConversionStore();
  const outputFormat = codec.toLowerCase();
  const quality = getQualityFromBitrate(bitrate);

  const handleFileSelect = (file: File) => {
    setIsPreparing(true);
    setSelectedFile(file);
    requestAnimationFrame(() => setIsPreparing(false));
  };

  const handleConvert = () => {
    if (!selectedFile) {
      return;
    }

    upload({
      file: selectedFile,
      outputFormat,
      quality,
      options: {
        bitrate,
        sampleRate,
        channels,
        bitDepth,
        metadata,
        gain,
        normalizePeak,
        enableNormalizePeak,
        enableTrim,
        startTime,
        endTime,
        useCustomStart,
        useCustomEnd,
      },
    });
  };

  const trackData = selectedFile
    ? {
        name: selectedFile.name,
        codec: getFileFormat(selectedFile),
        size: formatFileSize(selectedFile.size),
      }
    : null;

  const content = (() => {
    if (!isUploading && !isPreparing && !selectedFile) {
      return null;
    }

    return (
      <>
        {trackData ? <Track data={trackData} /> : null}
        {(isUploading || isPreparing) && <Spinner className="text-primary" />}
      </>
    );
  })();

  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <FileDropzone
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        disabled={isUploading || isPreparing}
      >
        {content}
      </FileDropzone>
      <Button
        className="self-end"
        disabled={!selectedFile || isUploading}
        onClick={handleConvert}
      >
        Convert
      </Button>
    </div>
  );
};

export { FileUpload };
