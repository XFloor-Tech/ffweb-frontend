const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const parseFilenameFromContentDisposition = (
  contentDisposition: string | null,
) => {
  if (!contentDisposition) return null;

  const match = /filename="(?<filename>[^"]+)"/.exec(contentDisposition);
  return match?.groups?.filename ?? null;
};

export { downloadBlob, parseFilenameFromContentDisposition };

