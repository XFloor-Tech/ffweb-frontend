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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <Label htmlFor="codec">Codec</Label>
            <Select value={codec} onValueChange={(value: any) => setCodec(value)} >
              <SelectTrigger id="codec" className="w-full">
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
              <SelectTrigger id="bitrate" className="w-full">
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
              <SelectTrigger id="sampleRate" className="w-full">
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
              <SelectTrigger id="channels" className="w-full">
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
    </div>
  );
}