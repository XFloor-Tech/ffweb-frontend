import { useEffect, useState } from "react";

const getMediaElementType = (file: File) => {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "audio";
};

const useSelectedFileDurationMs = (selectedFile: File | null) => {
  const [durationByFile, setDurationByFile] = useState<{
    file: File | null;
    durationMs: number | null;
  }>({
    file: null,
    durationMs: null,
  });

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const mediaElement = document.createElement(getMediaElementType(selectedFile));
    const objectUrl = URL.createObjectURL(selectedFile);
    let isCancelled = false;

    const cleanup = () => {
      mediaElement.removeAttribute("src");
      mediaElement.load();
      URL.revokeObjectURL(objectUrl);
    };

    const handleLoadedMetadata = () => {
      if (isCancelled) return;

      const nextDurationMs = Math.round(mediaElement.duration * 1000);
      setDurationByFile({
        file: selectedFile,
        durationMs:
          Number.isFinite(nextDurationMs) && nextDurationMs > 0
            ? nextDurationMs
            : null,
      });
      cleanup();
    };

    const handleError = () => {
      if (isCancelled) return;

      setDurationByFile({
        file: selectedFile,
        durationMs: null,
      });
      cleanup();
    };

    mediaElement.preload = "metadata";
    mediaElement.addEventListener("loadedmetadata", handleLoadedMetadata, {
      once: true,
    });
    mediaElement.addEventListener("error", handleError, {
      once: true,
    });
    mediaElement.src = objectUrl;
    mediaElement.load();

    return () => {
      isCancelled = true;
      mediaElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      mediaElement.removeEventListener("error", handleError);
      cleanup();
    };
  }, [selectedFile]);

  const durationMs =
    selectedFile && durationByFile.file === selectedFile
      ? durationByFile.durationMs
      : null;
  const isLoading = !!selectedFile && durationByFile.file !== selectedFile;

  return {
    durationMs,
    isLoading,
  };
};

export { useSelectedFileDurationMs };
