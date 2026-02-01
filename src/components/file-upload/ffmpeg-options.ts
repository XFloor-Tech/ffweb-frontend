import type { BitDepth, ConversionSettings } from "@/types/conversion-types";

type FfmpegGoOptions = {
  "b:a"?: string;
  ar?: string;
  ac?: string;
  sample_fmt?: string;
  af?: string;
  ss?: string;
  to?: string;
  map_metadata?: string;
  metadata?: Record<string, string>;
};

const parseSampleRateToHz = (sampleRate: string) => {
  const match = sampleRate.match(/(\d+(?:\.\d+)?)\s*kHz/i);
  if (match?.[1]) {
    const numeric = Number.parseFloat(match[1]);
    if (Number.isFinite(numeric)) {
      return Math.round(numeric * 1000);
    }
  }

  const asNumber = Number.parseInt(sampleRate, 10);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber;
  }

  return null;
};

const parseChannelsToCount = (channels: string) => {
  if (channels.includes("7.1")) return 8;
  if (channels.includes("5.1")) return 6;

  const match = channels.match(/\b(\d+)\b/);
  if (!match?.[1]) return null;

  const numeric = Number.parseInt(match[1], 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric;
};

const parseTimeDisplayToMs = (timeStr: string) => {
  if (!timeStr || timeStr.trim() === "") return 0;

  const cleanTime = timeStr.replace(/[^0-9:]/g, "");
  const parts = cleanTime.split(":").filter((part) => part !== "");

  if (parts.length === 3) {
    const minutes = Number.parseInt(parts[0] ?? "", 10) || 0;
    const seconds = Number.parseInt(parts[1] ?? "", 10) || 0;

    let milliseconds = Number.parseInt(parts[2] ?? "", 10) || 0;
    const rawMs = parts[2] ?? "";
    if (rawMs.length === 2) {
      milliseconds *= 10;
    } else if (rawMs.length === 1) {
      milliseconds *= 100;
    }

    return (minutes * 60 + seconds) * 1000 + milliseconds;
  }

  if (parts.length === 2) {
    const minutes = Number.parseInt(parts[0] ?? "", 10) || 0;
    const seconds = Number.parseInt(parts[1] ?? "", 10) || 0;
    return (minutes * 60 + seconds) * 1000;
  }

  if (parts.length === 1) {
    const seconds = Number.parseInt(parts[0] ?? "", 10) || 0;
    return seconds * 1000;
  }

  return 0;
};

const formatMsToFfmpegTime = (ms: number) => {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = safeMs % 1000;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
};

const parseTimeDisplayToFfmpegTime = (timeStr: string) => {
  if (!timeStr || timeStr.trim() === "") return null;
  const ms = parseTimeDisplayToMs(timeStr);
  return formatMsToFfmpegTime(ms);
};

const getSampleFormatFromBitDepth = (bitDepth: BitDepth) => {
  if (bitDepth === "16") return "s16";
  if (bitDepth === "24") return "s24";
  if (bitDepth === "32") return "s32";
  if (bitDepth.toLowerCase() === "float") return "fltp";
  return null;
};

const buildFfmpegGoOptions = (options: ConversionSettings): FfmpegGoOptions => {
  const outputOptions: FfmpegGoOptions = {};

  if (options.bitrate) {
    outputOptions["b:a"] = options.bitrate;
  }

  const sampleRateHz = parseSampleRateToHz(options.sampleRate);
  if (sampleRateHz) {
    outputOptions.ar = String(sampleRateHz);
  }

  const channelsCount = parseChannelsToCount(options.channels);
  if (channelsCount) {
    outputOptions.ac = String(channelsCount);
  }

  const sampleFormat = getSampleFormatFromBitDepth(options.bitDepth);
  if (sampleFormat) {
    outputOptions.sample_fmt = sampleFormat;
  }

  const audioFilters: string[] = [];
  if (typeof options.gain === "number" && options.gain !== 0) {
    const gainValue =
      options.gain > 0 ? `+${options.gain}` : String(options.gain);
    audioFilters.push(`volume=${gainValue}dB`);
  }

  if (
    options.enableNormalizePeak &&
    typeof options.normalizePeak === "number"
  ) {
    audioFilters.push(`loudnorm=I=${options.normalizePeak}`);
  }

  if (audioFilters.length > 0) {
    outputOptions.af = audioFilters.join(",");
  }

  if (options.enableTrim) {
    if (options.useCustomStart) {
      const start = parseTimeDisplayToFfmpegTime(options.startTime);
      if (start) {
        outputOptions.ss = start;
      }
    }

    if (options.useCustomEnd) {
      const end = parseTimeDisplayToFfmpegTime(options.endTime);
      if (end) {
        outputOptions.to = end;
      }
    }
  }

  if (options.metadata === "Remove") {
    outputOptions.map_metadata = "-1";
  } else if (options.metadata === "Clear") {
    outputOptions.metadata = {
      title: "",
      artist: "",
      album: "",
    };
  }

  return outputOptions;
};

const appendFfmpegGoOptionsToFormData = (
  formData: FormData,
  options: ConversionSettings,
) => {
  const outputOptions = buildFfmpegGoOptions(options);

  Object.entries(outputOptions).forEach(([key, value]) => {
    if (!value) return;

    if (key === "metadata" && typeof value === "object") {
      Object.entries(value).forEach(([metaKey, metaValue]) => {
        formData.append(`options[metadata][${metaKey}]`, metaValue);
      });
      return;
    }

    if (typeof value === "string") {
      formData.append(`options[${key}]`, value);
    }
  });
};

export {
  appendFfmpegGoOptionsToFormData,
  buildFfmpegGoOptions,
  type FfmpegGoOptions,
};
