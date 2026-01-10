// stores/conversionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CodecType =
  | "AAC"
  | "MP3"
  | "FLAC"
  | "WAV"
  | "AIFF"
  | "OGG"
  | "OPUS"
  | "M4A";
export type BitrateType = "64k" | "128k" | "192k" | "256k" | "320k";
export type SampleRateType = "44.1kHz" | "48kHz" | "96kHz" | "192kHz";
export type ChannelsType = "1 (Mono)" | "2 (Stereo)" | "5.1" | "7.1";
export type BitDepthType = "16" | "24" | "32" | "float";
export type MetadataType = "Preserve" | "Remove" | "Clear";

export interface ConversionStore {
  // Basic Settings
  codec: CodecType;
  bitrate: BitrateType;
  sampleRate: SampleRateType;
  channels: ChannelsType;
   useCustomStart: boolean;
  useCustomEnd: boolean;

  // Advanced Settings
  bitDepth: BitDepthType;
  metadata: MetadataType;
  gain: number; // in dB, e.g., 8 for +8db
  normalizePeak: number; // in negative dB, e.g., -3
  enableNormalizePeak: boolean;

  // Trimming Settings
  enableTrim: boolean;
  startTime: string; // HH:MM:SS.mmm format
  endTime: string;

  // Actions
  setCodec: (codec: CodecType) => void;
  setBitrate: (bitrate: BitrateType) => void;
  setSampleRate: (sampleRate: SampleRateType) => void;
  setChannels: (channels: ChannelsType) => void;
  setBitDepth: (bitDepth: BitDepthType) => void;
  setMetadata: (metadata: MetadataType) => void;
  setGain: (gain: number) => void;
  setNormalizePeak: (peak: number) => void;
  setEnableTrim: (enable: boolean) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  resetToDefaults: () => void;
  getFFmpegCommand: () => string;
   setUseCustomStart: (use: boolean) => void;
  setUseCustomEnd: (use: boolean) => void;
}

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

const DEFAULT_SETTINGS = {
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
  startTime: '0125120', // MMSSmmm format (01:25:120)
  endTime: '0000000',   // Default end time
};

export const useConversionStore = create<ConversionStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setCodec: (codec) => set({ codec }),
      setBitrate: (bitrate) => set({ bitrate }),
      setSampleRate: (sampleRate) => set({ sampleRate }),
      setChannels: (channels) => set({ channels }),
      setBitDepth: (bitDepth) => set({ bitDepth }),
      setMetadata: (metadata) => set({ metadata }),
      setGain: (gain) => set({ gain }),
      setNormalizePeak: (peak) => set({ normalizePeak: peak }),
      setEnableNormalizePeak: (enableNormalizePeak: any) =>
        set({ enableNormalizePeak }),
      setEnableTrim: (enableTrim) => set({ enableTrim }),
      setStartTime: (startTime) => set({ startTime }),
      setUseCustomStart: (useCustomStart) => set({ useCustomStart }),
setUseCustomEnd: (useCustomEnd) => set({ useCustomEnd }),
      setEndTime: (endTime) => set({ endTime }),

      resetToDefaults: () => set(DEFAULT_SETTINGS),

      getFFmpegCommand: () => {
        const state = get();
        const args = [];

        // Basic settings
        args.push(`-c:a ${state.codec.toLowerCase()}`);
        args.push(`-b:a ${state.bitrate}`);
        args.push(`-ar ${state.sampleRate.replace("kHz", "000")}`);

        // Channels (extract number)
        const channelsMatch = state.channels.match(/\d+/);
        if (channelsMatch) args.push(`-ac ${channelsMatch[0]}`);

        // Advanced settings
        if (state.bitDepth !== "16") {
          args.push(`-sample_fmt s${state.bitDepth}`);
        }

        if (state.gain !== 0) {
          const gainValue = state.gain > 0 ? `+${state.gain}` : state.gain;
          args.push(`-af "volume=${gainValue}dB"`);
        }

        if (state.normalizePeak < 0) {
          args.push(`-af "loudnorm=I=${Math.abs(state.normalizePeak)}"`);
        }

        // Trimming
        if (state.enableTrim) {
          args.push(`-ss ${state.startTime}`);
          args.push(`-to ${state.endTime}`);
        }

        // Metadata
        if (state.metadata === "Remove") {
          args.push(`-map_metadata -1`);
        } else if (state.metadata === "Clear") {
          args.push(
            `-metadata title="" -metadata artist="" -metadata album=""`,
          );
        }

        if (state.enableNormalizePeak && state.normalizePeak < 0) {
          args.push(`-af "loudnorm=I=${Math.abs(state.normalizePeak)}"`);
        }

        return `ffmpeg -i input.mp3 ${args.join(" ")} output.${state.codec.toLowerCase()}`;
      },
    }),
    {
      name: "audio-conversion-settings",
    },
  ),
);
