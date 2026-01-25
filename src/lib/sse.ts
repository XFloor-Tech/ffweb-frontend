type SseEvent = {
  data: string;
};

type StreamSseArgs = {
  url: string;
  signal?: AbortSignal;
  onEvent: (event: SseEvent) => void;
};

const streamSse = async ({ url, signal, onEvent }: StreamSseArgs) => {
  const response = await fetch(url, {
    headers: { Accept: "text/event-stream" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("SSE response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const delimiterIndex = buffer.indexOf("\n\n");
      const crlfDelimiterIndex = buffer.indexOf("\r\n\r\n");

      const nextIndex =
        delimiterIndex === -1
          ? crlfDelimiterIndex
          : crlfDelimiterIndex === -1
            ? delimiterIndex
            : Math.min(delimiterIndex, crlfDelimiterIndex);

      if (nextIndex === -1) break;

      const rawChunk = buffer.slice(0, nextIndex);
      buffer = buffer.slice(nextIndex + (buffer.startsWith("\r\n\r\n", nextIndex) ? 4 : 2));

      const lines = rawChunk.split(/\r?\n/);
      const dataLines = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trimStart());

      if (dataLines.length === 0) continue;

      onEvent({ data: dataLines.join("\n") });
    }
  }
};

export { streamSse };

