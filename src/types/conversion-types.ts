export type Codec =
  | "AAC"
  | "M4A"
  | "OGG"
  | "OPUS"
  | "MP3"
  | "FLAC"
  | "WAV"
  | "AIFF";

export type Bitrate =
  | "64k"
  | "96k"
  | "128k"
  | "160k"
  | "192k"
  | "256k"
  | "320k";

export type SampleRate = "44.1kHz" | "48kHz" | "96kHz" | "192kHz";

export type Channels = "1 (Mono)" | "2 (Stereo)" | "5.1" | "7.1";
export type BitDepth = "16" | "24" | "32" | "float";
export type Metadata = "Preserve" | "Remove" | "Clear";
export type Gain = number;
export type Peak = number;

// Time format HH:MM:SS.mmm or MM:SS.mmm or SS.mmm
export type TimeFormat = string;

export type BasicConversionSettings = {
  codec: Codec;
  bitrate: Bitrate;
  sampleRate: SampleRate;
  channels: Channels;
  selectedFormat?: Codec;
};

export type AdvancedAudioSettings = {
  bitDepth: BitDepth;
  metadata: Metadata;
  gain: Gain;
  normalizePeak: Peak;
};

export type TrimmingSettings = {
  enableTrim: boolean;
  startTime: TimeFormat;
  endTime: TimeFormat;
  useCustomStart: boolean;
  useCustomEnd: boolean;
  duration?: TimeFormat; // Calculated duration
};

export type ConversionSettings = BasicConversionSettings &
  AdvancedAudioSettings &
  TrimmingSettings & {
    showAdvanced: boolean;
    showTrimming: boolean;
  };
