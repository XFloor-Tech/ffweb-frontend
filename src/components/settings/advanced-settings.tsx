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
  METADATA_OPTIONS,
  isPcmFormat,
  useConversionStore,
} from "@/stores/conversionStore";

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

  const isBitDepthEnabled = isPcmFormat(codec);

  return (
    <div className="space-y-4">
      <div className="md:grid-cols- grid grid-cols-1 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Bit Depth */}
          <div className="space-y-3">
            <Label
              htmlFor="bitDepth"
              className="text-sm font-medium text-gray-300"
            >
              Bit Depth
              {!isBitDepthEnabled && (
                <span className="ml-2 text-xs text-gray-500">
                  (Only available for WAV, FLAC, AIFF)
                </span>
              )}
            </Label>
            <Select
              value={bitDepth}
              onValueChange={(value: any) => setBitDepth(value)}
              disabled={!isBitDepthEnabled}
            >
              <SelectTrigger
                id="bitDepth"
                className={`hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600 ${
                  !isBitDepthEnabled
                    ? "cursor-not-allowed border-gray-700/50 bg-gray-800/50 text-gray-500 opacity-50"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select bit depth" />
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
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <Label
              htmlFor="metadata"
              className="text-sm font-medium text-gray-300"
            >
              Metadata
            </Label>
            <Select
              value={metadata}
              onValueChange={(value: any) => setMetadata(value)}
            >
              <SelectTrigger
                id="metadata"
                className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 text-white hover:border-gray-600"
              >
                <SelectValue placeholder="Select metadata option" />
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Gain */}
          <div className="space-y-3">
            <Label htmlFor="gain" className="text-sm font-medium text-gray-300">
              Gain
            </Label>
            <div className="relative">
              <Input
                id="gain"
                type="text"
                value={gain > 0 ? `+${gain}db` : `${gain}db`}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
                  if (!isNaN(numValue)) {
                    setGain(numValue);
                  }
                }}
                className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 pr-10 text-white placeholder:text-gray-500 hover:border-gray-600"
                placeholder="0db"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-500">db</span>
              </div>
            </div>
          </div>

          {/* Normalize Max Peak */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="enable-normalize"
                  checked={enableNormalizePeak}
                  onCheckedChange={setEnableNormalizePeak}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor="enable-normalize"
                  className="cursor-pointer text-sm font-medium text-gray-300"
                >
                  Normalize Max Peak to:
                </Label>
              </div>

              <div className="relative w-[100px]">
                <Input
                  type="text"
                  value={enableNormalizePeak ? `${normalizePeak}db` : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(
                      value.replace(/[^0-9.-]+/g, ""),
                    );
                    if (!isNaN(numValue)) {
                      setNormalizePeak(numValue);
                    }
                  }}
                  className="hover:bg-gray-750 w-full border-gray-700 bg-gray-800 pr-10 text-center text-white placeholder:text-gray-500 hover:border-gray-600"
                  placeholder="Disabled"
                  disabled={!enableNormalizePeak}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-500">db</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
