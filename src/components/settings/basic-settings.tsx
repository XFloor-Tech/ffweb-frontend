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
        <h4 className="text-lg font-medium text-white mb-4">Audio Format Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Codec */}
          <div className="space-y-3">
            <Label htmlFor="codec" className="text-gray-300">Codec</Label>
            <Select value={codec} onValueChange={(value: any) => setCodec(value)}>
              <SelectTrigger 
                id="codec" 
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600"
              >
                <SelectValue placeholder="Select codec" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
          </div>
          
          {/* Bitrate */}
          <div className="space-y-3">
            <Label htmlFor="bitrate" className="text-gray-300">Bitrate</Label>
            <Select value={bitrate} onValueChange={(value: any) => setBitrate(value)}>
              <SelectTrigger 
                id="bitrate" 
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600"
              >
                <SelectValue placeholder="Select bitrate" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
          </div>
          
          {/* Sample Rate */}
          <div className="space-y-3">
            <Label htmlFor="sampleRate" className="text-gray-300">Sample Rate</Label>
            <Select value={sampleRate} onValueChange={(value: any) => setSampleRate(value)}>
              <SelectTrigger 
                id="sampleRate" 
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600"
              >
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
          </div>
          
          {/* Channels */}
          <div className="space-y-3">
            <Label htmlFor="channels" className="text-gray-300">Channels</Label>
            <Select value={channels} onValueChange={(value: any) => setChannels(value)}>
              <SelectTrigger 
                id="channels" 
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600"
              >
                <SelectValue placeholder="Select channels" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
        </div>
      </div>
    </div>
  );
}