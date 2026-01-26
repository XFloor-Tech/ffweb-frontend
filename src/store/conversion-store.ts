import { DEFAULT_SETTINGS } from "@/constants/conversion-constants";
import type {
  BitDepthType,
  BitrateType,
  ChannelsType,
  CodecType,
  ConversionSettings,
  MetadataType,
  SampleRateType,
} from "@/types/conversion-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConversionStore = ConversionSettings & {
  enableNormalizePeak: boolean;
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
  setEnableNormalizePeak: (enable: boolean) => void;
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

      setEnableNormalizePeak: (enableNormalizePeak: boolean) =>
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
