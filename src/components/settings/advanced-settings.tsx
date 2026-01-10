// components/advanced-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useConversionStore, BIT_DEPTH_OPTIONS, METADATA_OPTIONS } from '@/stores/conversionStore';
import { Sliders } from 'lucide-react';

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
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="bitDepth" className="text-sm font-medium">
                  Bit Depth
                </Label>
              </div>
              <div className="md:col-span-3">
                <Select value={bitDepth} onValueChange={(value: any) => setBitDepth(value)}>
                  <SelectTrigger id="bitDepth" className="w-full md:w-[200px]">
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
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="metadata" className="text-sm font-medium">
                  Metadata
                </Label>
              </div>
              <div className="md:col-span-3">
                <Select value={metadata} onValueChange={(value: any) => setMetadata(value)}>
                  <SelectTrigger id="metadata" className="w-full md:w-[200px]">
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

            {/* Gain Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="gain" className="text-sm font-medium">
                  Gain
                </Label>
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-[120px]">
                    <Input
                      id="gain"
                      type="text"
                      value={gain > 0 ? `+${gain}db` : `${gain}db`}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Extract numeric value from string like "+8db"
                        const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
                        if (!isNaN(numValue)) {
                          setGain(numValue);
                        }
                      }}
                      className="pr-10 text-center"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground text-sm">db</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Normalize Peak Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium">
                  Normalize Max Peak to:
                </Label>
              </div>
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative w-[120px]">
                    <Input
                      type="text"
                      value={enableNormalizePeak ? `${normalizePeak}db` : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Extract numeric value from string like "-3db"
                        const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
                        if (!isNaN(numValue)) {
                          setNormalizePeak(numValue);
                        }
                      }}
                      className="pr-10 text-center"
                      placeholder="Disabled"
                      disabled={!enableNormalizePeak}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground text-sm">db</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="enable-normalize"
                      checked={enableNormalizePeak}
                      onCheckedChange={setEnableNormalizePeak}
                    />
                    <Label htmlFor="enable-normalize" className="text-sm cursor-pointer">
                      Enable
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sets the maximum peak level for audio normalization
                </p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Summary of current settings */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Current Advanced Settings</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Bit Depth:</span>
            <span className="font-medium ml-2">{bitDepth}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Metadata:</span>
            <span className="font-medium ml-2">{metadata}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Gain:</span>
            <span className="font-medium ml-2">{gain > 0 ? `+${gain}` : gain}db</span>
          </div>
          <div>
            <span className="text-muted-foreground">Normalize Peak:</span>
            <span className="font-medium ml-2">
              {enableNormalizePeak ? `${normalizePeak}db` : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}