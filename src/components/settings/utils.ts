const parseTrimTimeToMs = (timeStr: string): number => {
  if (!timeStr || timeStr.trim() === "") return 0;

  const hasColon = timeStr.includes(":");

  if (hasColon) {
    const cleanTime = timeStr.replace(/[^0-9:]/g, "");
    const parts = cleanTime.split(":").filter((part) => part !== "");

    if (parts.length === 3) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;

      const rawMs = parts[2] ?? "0";
      let milliseconds = parseInt(rawMs, 10) || 0;

      if (rawMs.length === 2) milliseconds *= 10;
      if (rawMs.length === 1) milliseconds *= 100;

      return (minutes * 60 + seconds) * 1000 + milliseconds;
    }

    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return (minutes * 60 + seconds) * 1000;
    }

    if (parts.length === 1) {
      const seconds = parseInt(parts[0], 10) || 0;
      return seconds * 1000;
    }

    return 0;
  }

  const digits = timeStr.replace(/[^0-9]/g, "");
  if (digits === "") return 0;

  if (digits.length <= 2) {
    const seconds = parseInt(digits, 10) || 0;
    return seconds * 1000;
  }

  if (digits.length <= 4) {
    const minutes = parseInt(digits.slice(0, -2), 10) || 0;
    const seconds = parseInt(digits.slice(-2), 10) || 0;
    return (minutes * 60 + seconds) * 1000;
  }

  const clamped = digits.length > 7 ? digits.slice(0, 7) : digits;
  const milliseconds = parseInt(clamped.slice(-3), 10) || 0;
  const seconds = parseInt(clamped.slice(-5, -3), 10) || 0;
  const minutes = parseInt(clamped.slice(0, -5), 10) || 0;

  return (minutes * 60 + seconds) * 1000 + milliseconds;
};

const msToTrimDisplay = (ms: number): string => {
  const safeMs = Math.max(0, ms);

  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = safeMs % 1000;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
};

const normalizeTrimTimeInput = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length === 0) return "";

  const clamped = digits.length > 7 ? digits.slice(0, 7) : digits;

  if (clamped.length <= 2) return clamped;

  if (clamped.length <= 4) {
    const minutes = clamped.slice(0, 2);
    const seconds = clamped.slice(2);
    return `${minutes}:${seconds}`;
  }

  const minutes = clamped.slice(0, 2);
  const seconds = clamped.slice(2, 4);
  const milliseconds = clamped.slice(4);

  return `${minutes}:${seconds}:${milliseconds}`;
};

const formatTrimTimeForInput = (timeStr: string): string => {
  if (!timeStr || timeStr.trim() === "") return "";

  if (/^\d{2}:\d{2}:\d{3}$/.test(timeStr)) return timeStr;

  const ms = parseTrimTimeToMs(timeStr);
  return msToTrimDisplay(ms);
};

const clampMs = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const normalizeTrimRange = ({
  startMs,
  endMs,
  maxDurationMs,
  minSegmentMs,
}: {
  startMs: number;
  endMs: number;
  maxDurationMs: number;
  minSegmentMs: number;
}) => {
  const safeMaxDurationMs = Math.max(0, Math.floor(maxDurationMs));
  if (safeMaxDurationMs === 0) {
    return { startMs: 0, endMs: 0 };
  }

  const safeMinSegmentMs = Math.max(
    0,
    Math.min(Math.floor(minSegmentMs), safeMaxDurationMs),
  );

  let nextStartMs = clampMs(Math.floor(startMs), 0, safeMaxDurationMs);
  let nextEndMs = clampMs(Math.floor(endMs), 0, safeMaxDurationMs);

  if (nextEndMs < nextStartMs) {
    nextEndMs = Math.min(safeMaxDurationMs, nextStartMs + safeMinSegmentMs);
  }

  if (nextEndMs - nextStartMs < safeMinSegmentMs) {
    if (nextStartMs + safeMinSegmentMs <= safeMaxDurationMs) {
      nextEndMs = nextStartMs + safeMinSegmentMs;
    } else {
      nextEndMs = safeMaxDurationMs;
      nextStartMs = Math.max(0, nextEndMs - safeMinSegmentMs);
    }
  }

  return {
    startMs: nextStartMs,
    endMs: nextEndMs,
  };
};

export {
  formatTrimTimeForInput,
  msToTrimDisplay,
  normalizeTrimRange,
  normalizeTrimTimeInput,
  parseTrimTimeToMs,
};
