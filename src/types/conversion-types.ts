export type CodecType =
  | "AAC"
  | "M4A"
  | "OGG"
  | "OPUS"
  | "MP3"
  | "FLAC"
  | "WAV"
  | "AIFF";

export type BitrateType =
  | "64k"
  | "96k"
  | "128k"
  | "160k"
  | "192k"
  | "256k"
  | "320k";

export type SampleRateType = "44.1kHz" | "48kHz" | "96kHz" | "192kHz";

export type ChannelsType = "1 (Mono)" | "2 (Stereo)" | "5.1" | "7.1";
export type BitDepthType = "16" | "24" | "32" | "float";
export type MetadataType = "Preserve" | "Remove" | "Clear";
export type GainType = number;
export type PeakType = number;

// Time format HH:MM:SS.mmm or MM:SS.mmm or SS.mmm
export type TimeFormat = string;

export type BasicConversionSettings = {
  codec: CodecType;
  bitrate: BitrateType;
  sampleRate: SampleRateType;
  channels: ChannelsType;
  selectedFormat?: CodecType;
};

export type AdvancedAudioSettings = {
  bitDepth: BitDepthType;
  metadata: MetadataType;
  gain: GainType;
  normalizePeak: PeakType;
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
