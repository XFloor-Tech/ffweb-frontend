import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  BIT_DEPTH_OPTIONS,
  LOSELESS_CODECS,
  METADATA_OPTIONS,
} from "@/constants/conversion-constants";
import { useConversionStore } from "@/store/conversion-store";
import type { BitDepth, Metadata } from "@/types/conversion-types";
import { NumberInput } from "../number-input";

export function AdvancedSettings() {
  const {
    codec,
    bitDepth,
    metadata,
    gain,
    normalizePeak,
    enableNormalizePeak,
    setBitDepth,
    setMetadata,
    setGain,
    setNormalizePeak,
    setEnableNormalizePeak,
  } = useConversionStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Show bit depth only for lossless codecs */}
        {LOSELESS_CODECS.some((c) => c === codec) && (
          <Select
            value={bitDepth}
            onValueChange={(value) => setBitDepth(value as BitDepth)}
          >
            <SelectTrigger
              id="bitDepth"
              className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
            >
              <SelectValue placeholder="Select bit depth" label="Bit Depth" />
            </SelectTrigger>

            <SelectContent className="border-gray-700 bg-gray-800 text-white">
              {BIT_DEPTH_OPTIONS.map((option) => (
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
        )}

        <Select
          value={metadata}
          onValueChange={(value) => setMetadata(value as Metadata)}
        >
          <SelectTrigger
            id="metadata"
            className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
          >
            <SelectValue
              placeholder="Select metadata option"
              label="Metadata"
            />
          </SelectTrigger>

          <SelectContent className="border-gray-700 bg-gray-800 text-white">
            {METADATA_OPTIONS.map((option) => (
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

      <div className="space-y-6">
        <NumberInput
          id="gain"
          value={gain}
          onValueChange={(value) => {
            if (!isNaN(value)) {
              setGain(value);
            }
          }}
          className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 hover:border-gray-600"
          placeholder="0db"
          label="Gain"
          postElement="db"
          min={-7}
          max={10}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Switch
                id="enable-normalize"
                checked={enableNormalizePeak}
                onCheckedChange={setEnableNormalizePeak}
              />

              <Label
                htmlFor="enable-normalize"
                className="text-small font-medium text-nowrap"
              >
                Normalize Max Peak to:
              </Label>
            </div>

            <Input
              type="text"
              value={enableNormalizePeak ? `${normalizePeak}db` : ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(numValue)) {
                  setNormalizePeak(numValue);
                }
              }}
              className="hover:bg-gray-750 h-9 w-full border-gray-700 bg-gray-800 text-start text-white placeholder:text-gray-500 hover:border-gray-600"
              placeholder="-7db"
              disabled={!enableNormalizePeak}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
