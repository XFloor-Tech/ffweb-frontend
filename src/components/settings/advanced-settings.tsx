// components/advanced-settings.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  BIT_DEPTH_OPTIONS,
  METADATA_OPTIONS,
  useConversionStore,
} from "@/stores/conversionStore";

export function AdvancedSettings() {
  const {
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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Bit Depth Row */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-1">
              <Label htmlFor="bitDepth" className="text-sm font-medium">
                Bit Depth
              </Label>

              <div className="md:col-span-3">
                <Select
                  value={bitDepth}
                  onValueChange={(value: any) => setBitDepth(value)}
                >
                  <SelectTrigger id="bitDepth" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BIT_DEPTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Metadata Row */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-1">
              <div className="md:col-span-1">
                <Label htmlFor="metadata" className="text-sm font-medium">
                  Metadata
                </Label>
              </div>
              <div className="md:col-span-3">
                <Select
                  value={metadata}
                  onValueChange={(value: any) => setMetadata(value)}
                >
                  <SelectTrigger id="metadata" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METADATA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-1">
              <div className="md:col-span-1">
                <Label htmlFor="gain" className="text-sm font-medium">
                  Gain
                </Label>
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      id="gain"
                      type="text"
                      value={gain > 0 ? `+${gain}db` : `${gain}db`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseFloat(
                          value.replace(/[^0-9.-]+/g, ""),
                        );
                        if (!isNaN(numValue)) {
                          setGain(numValue);
                        }
                      }}
                      className="pr-10 text-center"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-sm text-muted-foreground">db</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="w-full flex">
              <div className="w-full">
                <Switch
                  id="enable-normalize"
                  checked={enableNormalizePeak}
                  onCheckedChange={setEnableNormalizePeak}
                />
                <Label className="text-sm font-medium">
                  Normalize Max Peak to:
                </Label>
              </div>
              <div className="space-y-3 md:col-span-3">
                <div className="flex items-center gap-4">
                  <div className="relative w-[120px]">
                    <Input
                      type="text"
                      value={enableNormalizePeak ? `${normalizePeak}db` : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Extract numeric value from string like "-3db"
                        const numValue = parseFloat(
                          value.replace(/[^0-9.-]+/g, ""),
                        );
                        if (!isNaN(numValue)) {
                          setNormalizePeak(numValue);
                        }
                      }}
                      className="pr-10 text-center"
                      placeholder="Disabled"
                      disabled={!enableNormalizePeak}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-sm text-muted-foreground">db</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
