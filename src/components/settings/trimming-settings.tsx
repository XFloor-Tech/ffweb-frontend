// components/trimming-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Scissors, Play, Pause } from 'lucide-react';
import { useConversionStore } from '@/stores/conversionStore';

export function TrimmingSettings() {
  const {
    enableTrim,
    startTime,
    endTime,
    setEnableTrim,
    setStartTime,
    setEndTime,
  } = useConversionStore();

  const formatTime = (time: string) => {
    // Convert to MM:SS.mmm format if needed
    if (time.includes(':')) {
      const parts = time.split(':');
      if (parts.length === 3) {
        // HH:MM:SS.mmm -> MM:SS.mmm
        return `${parts[1]}:${parts[2]}`;
      }
    }
    return time;
  };

  const parseTime = (time: string) => {
    // Convert from input format to store format
    if (time.match(/^\d{2}:\d{2}\.\d{3}$/)) {
      // MM:SS.mmm -> 00:MM:SS.mmm
      return `00:${time}`;
    }
    return time;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audio Trimming</h3>
        <div className="flex items-center gap-2">
          <Switch
            checked={enableTrim}
            onCheckedChange={setEnableTrim}
            id="trim-enable"
          />
          <Label htmlFor="trim-enable" className="cursor-pointer">
            Enable Trimming
          </Label>
        </div>
      </div>

      {enableTrim && (
        <div className="space-y-6">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="start-time">Start Time</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => {
                      // Decrease by 1 second
                      const time = parseTime(startTime);
                      const [h, m, s] = time.split(':');
                      const [sec, ms] = s.split('.');
                      const totalMs = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
                      const newMs = Math.max(0, totalMs - 1000);
                      const newTime = formatTime(
                        `${Math.floor(newMs / 3600000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 3600000) / 60000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 60000) / 1000).toString().padStart(2, '0')}.` +
                        `${(newMs % 1000).toString().padStart(3, '0')}`
                      );
                      setStartTime(newTime);
                    }}
                  >
                    -1s
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => {
                      // Increase by 1 second
                      const time = parseTime(startTime);
                      const [h, m, s] = time.split(':');
                      const [sec, ms] = s.split('.');
                      const totalMs = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
                      const newMs = totalMs + 1000;
                      const newTime = formatTime(
                        `${Math.floor(newMs / 3600000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 3600000) / 60000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 60000) / 1000).toString().padStart(2, '0')}.` +
                        `${(newMs % 1000).toString().padStart(3, '0')}`
                      );
                      setStartTime(newTime);
                    }}
                  >
                    +1s
                  </Button>
                </div>
              </div>
              <Input
                id="start-time"
                value={formatTime(startTime)}
                onChange={(e) => setStartTime(parseTime(e.target.value))}
                placeholder="MM:SS.mmm"
                className="font-mono"
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="custom-start" defaultChecked />
                <Label htmlFor="custom-start" className="text-sm">
                  Custom Start Time
                </Label>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="end-time">End Time</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => {
                      // Decrease by 1 second
                      const time = parseTime(endTime);
                      const [h, m, s] = time.split(':');
                      const [sec, ms] = s.split('.');
                      const totalMs = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
                      const newMs = Math.max(0, totalMs - 1000);
                      const newTime = formatTime(
                        `${Math.floor(newMs / 3600000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 3600000) / 60000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 60000) / 1000).toString().padStart(2, '0')}.` +
                        `${(newMs % 1000).toString().padStart(3, '0')}`
                      );
                      setEndTime(newTime);
                    }}
                  >
                    -1s
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => {
                      // Increase by 1 second
                      const time = parseTime(endTime);
                      const [h, m, s] = time.split(':');
                      const [sec, ms] = s.split('.');
                      const totalMs = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
                      const newMs = totalMs + 1000;
                      const newTime = formatTime(
                        `${Math.floor(newMs / 3600000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 3600000) / 60000).toString().padStart(2, '0')}:` +
                        `${Math.floor((newMs % 60000) / 1000).toString().padStart(2, '0')}.` +
                        `${(newMs % 1000).toString().padStart(3, '0')}`
                      );
                      setEndTime(newTime);
                    }}
                  >
                    +1s
                  </Button>
                </div>
              </div>
              <Input
                id="end-time"
                value={formatTime(endTime)}
                onChange={(e) => setEndTime(parseTime(e.target.value))}
                placeholder="MM:SS.mmm"
                className="font-mono"
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="custom-end" defaultChecked />
                <Label htmlFor="custom-end" className="text-sm">
                  Custom End Time
                </Label>
              </div>
            </div>
          </div>

          {/* Duration Display */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Trim Duration</h4>
                <p className="text-xs text-muted-foreground">
                  Calculated from start to end time
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono">
                  {(() => {
                    try {
                      const start = parseTime(startTime);
                      const end = parseTime(endTime);
                      const [h1, m1, s1] = start.split(':');
                      const [h2, m2, s2] = end.split(':');
                      const [sec1, ms1] = s1.split('.');
                      const [sec2, ms2] = s2.split('.');
                      
                      const startMs = (parseInt(h1) * 3600 + parseInt(m1) * 60 + parseInt(sec1)) * 1000 + parseInt(ms1);
                      const endMs = (parseInt(h2) * 3600 + parseInt(m2) * 60 + parseInt(sec2)) * 1000 + parseInt(ms2);
                      const durationMs = Math.max(0, endMs - startMs);
                      
                      const minutes = Math.floor(durationMs / 60000);
                      const seconds = Math.floor((durationMs % 60000) / 1000);
                      const milliseconds = durationMs % 1000;
                      
                      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
                    } catch {
                      return '00:00.000';
                    }
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">MM:SS.mmm</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Scissors className="h-3 w-3" />
              Set to Current Playback
            </Button>
            <Button variant="outline" size="sm">
              Swap Start/End
            </Button>
            <Button variant="outline" size="sm">
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {!enableTrim && (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Trimming is disabled</p>
          <p className="text-sm text-muted-foreground mt-1">
            Enable trimming to select specific portions of your audio
          </p>
        </div>
      )}
    </div>
  );
}