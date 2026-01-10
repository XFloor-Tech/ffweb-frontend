// components/basic-settings.tsx
import React from 'react';
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversionStore, CODEC_OPTIONS, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS, CHANNELS_OPTIONS } from '@/stores/conversionStore';

export function BasicSettings() {
  const { 
    codec, 
    bitrate, 
    sampleRate, 
    channels,
    setCodec,
    setBitrate,
    setSampleRate,
    setChannels 
  } = useConversionStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Codec */}
          <div className="space-y-2">
            <Label htmlFor="codec">Codec</Label>
            <Select value={codec} onValueChange={(value: any) => setCodec(value)}>
              <SelectTrigger id="codec">
                <SelectValue placeholder="Select codec" />
              </SelectTrigger>
              <SelectContent>
                {CODEC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bitrate */}
          <div className="space-y-2">
            <Label htmlFor="bitrate">Bitrate</Label>
            <Select value={bitrate} onValueChange={(value: any) => setBitrate(value)}>
              <SelectTrigger id="bitrate">
                <SelectValue placeholder="Select bitrate" />
              </SelectTrigger>
              <SelectContent>
                {BITRATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sample Rate */}
          <div className="space-y-2">
            <Label htmlFor="sampleRate">Sample Rate</Label>
            <Select value={sampleRate} onValueChange={(value: any) => setSampleRate(value)}>
              <SelectTrigger id="sampleRate">
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Channels */}
          <div className="space-y-2">
            <Label htmlFor="channels">Channels</Label>
            <Select value={channels} onValueChange={(value: any) => setChannels(value)}>
              <SelectTrigger id="channels">
                <SelectValue placeholder="Select channels" />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
        </div>
      </div>
      
      {/* Current Settings Preview */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Current Settings</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Codec:</span>
            <span className="font-medium">{codec}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bitrate:</span>
            <span className="font-medium">{bitrate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sample Rate:</span>
            <span className="font-medium">{sampleRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Channels:</span>
            <span className="font-medium">{channels}</span>
          </div>
        </div>
      </div>
    </div>
  );
}