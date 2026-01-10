const getFileFormat = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? extension.toUpperCase() : "Unknown";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`;
  }

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

const getQualityFromBitrate = (bitrate: string) => {
  const numeric = parseInt(bitrate.replace("k", ""), 10);

  if (Number.isNaN(numeric)) {
    return "medium";
  }

  if (numeric <= 128) {
    return "low";
  }

  if (numeric <= 192) {
    return "medium";
  }

  return "high";
};

export { formatFileSize, getFileFormat, getQualityFromBitrate };
