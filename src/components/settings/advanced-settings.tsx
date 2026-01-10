// components/advanced-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useConversionStore, BIT_DEPTH_OPTIONS, METADATA_OPTIONS } from '@/stores/conversionStore';

export function AdvancedSettings() {
  const {
    bitDepth,
    metadata,
    gain,
    normalizePeak,
    setBitDepth,
    setMetadata,
    setGain,
    setNormalizePeak,
  } = useConversionStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Audio Processing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bit Depth */}
          <div className="space-y-3">
            <Label htmlFor="bitDepth">Bit Depth</Label>
            <Select value={bitDepth} onValueChange={(value: any) => setBitDepth(value)}>
              <SelectTrigger id="bitDepth">
                <SelectValue placeholder="Select bit depth" />
              </SelectTrigger>
              <SelectContent>
                {BIT_DEPTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              32-bit provides highest quality for processing
            </p>
          </div>
          
          {/* Metadata */}
          <div className="space-y-3">
            <Label htmlFor="metadata">Metadata</Label>
            <Select value={metadata} onValueChange={(value: any) => setMetadata(value)}>
              <SelectTrigger id="metadata">
                <SelectValue placeholder="Select metadata option" />
              </SelectTrigger>
              <SelectContent>
                {METADATA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Control how audio metadata is handled
            </p>
          </div>
          
          {/* Gain */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="gain">Gain: {gain > 0 ? `+${gain}` : gain}dB</Label>
              <Input
                type="number"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
                className="w-20 h-8"
                min="-24"
                max="24"
                step="0.5"
              />
            </div>
            <Slider
              id="gain"
              value={[gain]}
              onValueChange={([value]) => setGain(value)}
              min={-24}
              max={24}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-24dB</span>
              <span>0dB</span>
              <span>+24dB</span>
            </div>
          </div>
          
          {/* Normalize Peak */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="peak">Normalize Max Peak to: {normalizePeak}dB</Label>
              <Input
                type="number"
                value={normalizePeak}
                onChange={(e) => setNormalizePeak(Number(e.target.value))}
                className="w-20 h-8"
                min={-12}
                max={0}
                step={0.5}
              />
            </div>
            <Slider
              id="peak"
              value={[Math.abs(normalizePeak)]}
              onValueChange={([value]) => setNormalizePeak(-value)}
              min={0}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-12dB</span>
              <span>-6dB</span>
              <span>0dB</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Sets maximum peak level for loudness normalization
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}