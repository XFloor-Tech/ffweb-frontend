import type {
  BitDepth,
  Bitrate,
  Channels,
  Codec,
  ConversionSettings,
  Metadata,
  SampleRate,
} from "@/types/conversion-types";

type SelectOption<TValue extends string> = Readonly<{
  value: TValue;
  label: string;
}>;

type DefaultSettings = ConversionSettings & {
  enableNormalizePeak: boolean;
};

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
] as const satisfies ReadonlyArray<SelectOption<Codec>>;

export const BITRATE_OPTIONS = [
  { value: "64k", label: "64 kbps" },
  { value: "128k", label: "128 kbps" },
  { value: "192k", label: "192 kbps" },
  { value: "256k", label: "256 kbps" },
  { value: "320k", label: "320 kbps" },
] as const satisfies ReadonlyArray<SelectOption<Bitrate>>;

export const SAMPLE_RATE_OPTIONS = [
  { value: "44.1kHz", label: "44.1 kHz" },
  { value: "48kHz", label: "48 kHz" },
  { value: "96kHz", label: "96 kHz" },
  { value: "192kHz", label: "192 kHz" },
] as const satisfies ReadonlyArray<SelectOption<SampleRate>>;

export const CHANNELS_OPTIONS = [
  { value: "1 (Mono)", label: "Mono" },
  { value: "2 (Stereo)", label: "Stereo" },
  { value: "5.1", label: "5.1 Surround" },
  { value: "7.1", label: "7.1 Surround" },
] as const satisfies ReadonlyArray<SelectOption<Channels>>;

export const BIT_DEPTH_OPTIONS = [
  { value: "16", label: "16-bit" },
  { value: "24", label: "24-bit" },
  { value: "32", label: "32-bit" },
  { value: "float", label: "32-bit Float" },
] as const satisfies ReadonlyArray<SelectOption<BitDepth>>;

export const METADATA_OPTIONS = [
  { value: "Preserve", label: "Preserve" },
  { value: "Remove", label: "Remove" },
  { value: "Clear", label: "Clear All" },
] as const satisfies ReadonlyArray<SelectOption<Metadata>>;

export const DEFAULT_SETTINGS = {
  codec: "AAC",
  bitrate: "320k",
  sampleRate: "48kHz",
  channels: "2 (Stereo)",
  bitDepth: "32",
  metadata: "Preserve",
  gain: 0,
  normalizePeak: -7, // TODO: check what allowed values are.
  enableNormalizePeak: false,
  enableTrim: false,
  useCustomStart: true,
  useCustomEnd: true,
  startTime: "0125120", // MMSSmmm format (01:25:120)
  endTime: "0000000", // Default end time
  showAdvanced: false,
  showTrimming: false,
} satisfies DefaultSettings;
