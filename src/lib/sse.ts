import { API_BASE_URL } from "@/lib/api-client";

type SseEvent = {
  data: string;
};

type StreamSseArgs = {
  url: string;
  signal?: AbortSignal;
  onEvent: (event: SseEvent) => void;
};

const isAbsoluteUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://");

const resolveSseUrl = (url: string) => {
  if (isAbsoluteUrl(url) || !API_BASE_URL) return url;

  try {
    const urlWithoutHeadSlash = url.slice(1);

    return new URL(urlWithoutHeadSlash, API_BASE_URL).toString();
  } catch {
    const normalizedBase = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${normalizedBase}${normalizedUrl}`;
  }
};

const streamSse = async ({ url, signal, onEvent }: StreamSseArgs) => {
  const resolvedUrl = resolveSseUrl(url);

  await new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(resolvedUrl);

    const close = () => {
      eventSource.close();
      resolve();
    };

    if (signal?.aborted) {
      close();
      return;
    }

    signal?.addEventListener("abort", close, { once: true });

    eventSource.addEventListener("message", (event) => {
      if (!("data" in event)) return;
      onEvent({ data: String((event as MessageEvent).data) });
    });

    eventSource.addEventListener("error", () => {
      if (signal?.aborted) return;
      eventSource.close();
      reject(new Error("SSE connection error"));
    });
  });
};

export { streamSse };
