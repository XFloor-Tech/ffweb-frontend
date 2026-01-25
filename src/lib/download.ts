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
  contentDisposition: string | null | undefined,
) => {
  if (!contentDisposition) return null;

  const encodedMatch = /filename\*\s*=\s*(?<value>[^;]+)/i.exec(
    contentDisposition,
  );
  const encodedValue = encodedMatch?.groups?.value?.trim();
  if (encodedValue) {
    const unquoted = encodedValue.replace(/^"(.*)"$/, "$1");
    const rfc5987Match =
      /^(?<charset>[^']*)'(?<language>[^']*)'(?<encoded>.*)$/.exec(unquoted);
    const encoded = rfc5987Match?.groups?.encoded ?? unquoted;
    try {
      const decoded = decodeURIComponent(encoded);
      if (decoded) return decoded.split(/[\\/]/).pop() ?? decoded;
    } catch {
      if (encoded) return encoded.split(/[\\/]/).pop() ?? encoded;
    }
  }

  const filenameMatch =
    /filename\s*=\s*(?:"(?<quoted>[^"]+)"|(?<unquoted>[^;]+))/i.exec(
      contentDisposition,
    );
  const filename =
    filenameMatch?.groups?.quoted ?? filenameMatch?.groups?.unquoted?.trim();
  if (!filename) return null;

  return filename.split(/[\\/]/).pop() ?? filename;
};

export { downloadBlob, parseFilenameFromContentDisposition };
