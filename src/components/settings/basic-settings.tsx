import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BITRATE_OPTIONS,
  CHANNELS_OPTIONS,
  CODEC_OPTIONS,
  SAMPLE_RATE_OPTIONS,
} from "@/constants/conversion-constants";
import { useConversionStore } from "@/store/conversion-store";
import type {
  Bitrate,
  Channels,
  Codec,
  SampleRate,
} from "@/types/conversion-types";

export function BasicSettings() {
  const {
    codec,
    bitrate,
    sampleRate,
    channels,
    setCodec,
    setBitrate,
    setSampleRate,
    setChannels,
  } = useConversionStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Codec */}
      <Select value={codec} onValueChange={(value) => setCodec(value as Codec)}>
        <SelectTrigger
          id="codec"
          className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
        >
          <SelectValue placeholder="Select codec" label="Codec" />
        </SelectTrigger>

        <SelectContent className="border-gray-700 bg-gray-800 text-white">
          {CODEC_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-gray-700 focus:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={bitrate}
        onValueChange={(value) => setBitrate(value as Bitrate)}
      >
        <SelectTrigger
          id="bitrate"
          className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
        >
          <SelectValue placeholder="Select bitrate" label="Bitrate" />
        </SelectTrigger>

        <SelectContent className="border-gray-700 bg-gray-800 text-white">
          {BITRATE_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-gray-700 focus:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sampleRate}
        onValueChange={(value) => setSampleRate(value as SampleRate)}
      >
        <SelectTrigger
          id="sampleRate"
          className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
        >
          <SelectValue placeholder="Select sample rate" label="Sample Rate" />
        </SelectTrigger>

        <SelectContent className="border-gray-700 bg-gray-800 text-white">
          {SAMPLE_RATE_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-gray-700 focus:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={channels}
        onValueChange={(value) => setChannels(value as Channels)}
      >
        <SelectTrigger
          id="channels"
          className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
        >
          <SelectValue placeholder="Select channels" label="Channels" />
        </SelectTrigger>

        <SelectContent className="border-gray-700 bg-gray-800 text-white">
          {CHANNELS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-gray-700 focus:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
