import type {
  BitDepthType,
  BitrateType,
  ChannelsType,
  CodecType,
  MetadataType,
  SampleRateType,
} from "@/types/conversion-types";

// Available options
export const CODEC_OPTIONS = [
  { value: "AAC", label: "AAC" },
  { value: "MP3", label: "MP3" },
  { value: "FLAC", label: "FLAC" },
  { value: "WAV", label: "WAV" },
  { value: "AIFF", label: "AIFF" },
  { value: "OGG", label: "OGG" },
  { value: "OPUS", label: "OPUS" },
  { value: "M4A", label: "M4A" },
] as const;

export const BITRATE_OPTIONS = [
  { value: "64k", label: "64 kbps" },
  { value: "128k", label: "128 kbps" },
  { value: "192k", label: "192 kbps" },
  { value: "256k", label: "256 kbps" },
  { value: "320k", label: "320 kbps" },
] as const;

export const SAMPLE_RATE_OPTIONS = [
  { value: "44.1kHz", label: "44.1 kHz" },
  { value: "48kHz", label: "48 kHz" },
  { value: "96kHz", label: "96 kHz" },
  { value: "192kHz", label: "192 kHz" },
] as const;

export const CHANNELS_OPTIONS = [
  { value: "1 (Mono)", label: "Mono" },
  { value: "2 (Stereo)", label: "Stereo" },
  { value: "5.1", label: "5.1 Surround" },
  { value: "7.1", label: "7.1 Surround" },
] as const;

export const BIT_DEPTH_OPTIONS = [
  { value: "16", label: "16-bit" },
  { value: "24", label: "24-bit" },
  { value: "32", label: "32-bit" },
  { value: "float", label: "32-bit Float" },
] as const;

export const METADATA_OPTIONS = [
  { value: "Preserve", label: "Preserve" },
  { value: "Remove", label: "Remove" },
  { value: "Clear", label: "Clear All" },
] as const;

export const DEFAULT_SETTINGS = {
  codec: "AAC" as CodecType,
  bitrate: "320k" as BitrateType,
  sampleRate: "48kHz" as SampleRateType,
  channels: "2 (Stereo)" as ChannelsType,
  bitDepth: "32" as BitDepthType,
  metadata: "Preserve" as MetadataType,
  gain: 8, // +8db
  normalizePeak: -3, // -3db
  enableNormalizePeak: true, // or false based on your preference
  enableTrim: false,
  useCustomStart: true,
  useCustomEnd: true,
  startTime: "0125120", // MMSSmmm format (01:25:120)
  endTime: "0000000", // Default end time
  showAdvanced: false,
  showTrimming: false,
};
