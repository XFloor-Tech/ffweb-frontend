import { useCallback, useEffect, useRef } from "react";

const DOWNLOAD_CLEANUP_DELAY_MS = 10_000;

const isIOSDevice = () => {
  const userAgent = window.navigator.userAgent;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1)
  );
};

const useDownloadBlob = () => {
  const activeUrlsRef = useRef<Set<string>>(new Set());
  const timeoutIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    const activeUrls = activeUrlsRef.current;

    return () => {
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutIds.clear();

      activeUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      activeUrls.clear();
    };
  }, []);

  return useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    activeUrlsRef.current.add(url);

    const scheduleCleanup = () => {
      // Mobile browsers may start download with a delay; revoking too early breaks it.
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
        activeUrlsRef.current.delete(url);
        timeoutIdsRef.current.delete(timeoutId);
      }, DOWNLOAD_CLEANUP_DELAY_MS);

      timeoutIdsRef.current.add(timeoutId);
    };

    const openInNewTab = () => {
      const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!openedWindow) {
        window.location.href = url;
      }
    };

    if (isIOSDevice()) {
      const file = new File([blob], filename, {
        type: blob.type || "application/octet-stream",
      });

      let canShareFiles = false;
      if (typeof window.navigator.canShare === "function") {
        try {
          canShareFiles = window.navigator.canShare({ files: [file] });
        } catch {
          canShareFiles = false;
        }
      }

      if (canShareFiles && typeof window.navigator.share === "function") {
        void window.navigator
          .share({ files: [file], title: filename })
          .catch(() => openInNewTab());
      } else {
        openInNewTab();
      }

      scheduleCleanup();
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    scheduleCleanup();
  }, []);
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

export { parseFilenameFromContentDisposition, useDownloadBlob };
