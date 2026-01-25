import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useConversionStore } from "@/stores/conversionStore";
import { Scissors } from "lucide-react";
import { useEffect, useState } from "react";

export function TrimmingSettings() {
  const {
    enableTrim,
    startTime,
    endTime,
    setEnableTrim,
    setStartTime,
    setEndTime,
  } = useConversionStore();

  const timeToMs = (timeStr: string): number => {
    if (!timeStr || timeStr.trim() === "") return 0;

    const cleanTime = timeStr.replace(/[^0-9:]/g, "");

    const parts = cleanTime.split(":").filter((part) => part !== "");

    if (parts.length === 3) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;

      let milliseconds = parseInt(parts[2]) || 0;
      if (parts[2].length === 2) {
        milliseconds = milliseconds * 10;
      } else if (parts[2].length === 1) {
        milliseconds = milliseconds * 100;
      }

      return (minutes * 60 + seconds) * 1000 + milliseconds;
    } else if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return (minutes * 60 + seconds) * 1000;
    } else if (parts.length === 1) {
      const seconds = parseInt(parts[0]) || 0;
      return seconds * 1000;
    }

    return 0;
  };

  const msToDisplay = (ms: number): string => {
    if (ms < 0) ms = 0;

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
  };

  const parseDisplayToMs = (display: string): number => {
    return timeToMs(display);
  };

  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]);
  const [maxDuration, setMaxDuration] = useState(300000);

  useEffect(() => {
    const startMs = parseDisplayToMs(startTime);
    const endMs = parseDisplayToMs(endTime);

    const validEndMs = endMs > startMs ? endMs : startMs + 1000;
    if (endMs <= startMs) {
      setEndTime(msToDisplay(validEndMs));
    }

    setSliderRange([startMs, validEndMs]);
  }, [startTime, endTime]);

  const handleSliderChange = (value: number[]) => {
    if (value.length === 2) {
      const [newStart, newEnd] = value;

      if (newStart < newEnd) {
        setStartTime(msToDisplay(newStart));
        setEndTime(msToDisplay(newEnd));
      } else if (newStart >= newEnd) {
        setStartTime(msToDisplay(newStart));
        setEndTime(msToDisplay(newStart + 1000));
      }
    }
  };

  const handleTimeInputChange = (type: "start" | "end", value: string) => {
    const cleaned = value.replace(/[^0-9:]/g, "");

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 5) + ":" + formatted.slice(5, 8);
    }

    if (type === "start") {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
  };

  const formatTimeForInput = (timeStr: string): string => {
    if (!timeStr || timeStr.trim() === "") return "";

    if (timeStr.match(/^\d{2}:\d{2}:\d{3}$/)) {
      return timeStr;
    }

    const ms = parseDisplayToMs(timeStr);
    return msToDisplay(ms);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4">Trim Settings</h4>
        <div className="space-y-6">
          {/* Enable Trim */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="trim-enable"
              checked={enableTrim}
              onCheckedChange={(checked) => setEnableTrim(checked as boolean)}
              className="border-gray-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <div className="space-y-1">
              <Label
                htmlFor="trim-enable"
                className="cursor-pointer text-base font-medium text-gray-300"
              >
                Trim
              </Label>
            </div>
          </div>

          {enableTrim && (
            <>
              <Separator className="bg-gray-800" />
            

              {/* Visual Slider */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Trim Range</Label>
                </div>

                <div className="py-4">
                  <Slider
                    value={[sliderRange[0], sliderRange[1]]}
                    onValueChange={handleSliderChange}
                    min={0}
                    max={maxDuration}
                    step={100}
                    className="w-full"
                  />

                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{msToDisplay(0)}</span>
                    <span>{msToDisplay(maxDuration / 2)}</span>
                    <span>{msToDisplay(maxDuration)}</span>
                  </div>
                </div>
              </div>

                            {/* Time Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div className="space-y-3">
                  <Label htmlFor="start-time" className="text-sm font-medium text-gray-300">
                    Start Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="start-time"
                      type="text"
                      value={formatTimeForInput(startTime)}
                      onChange={(e) => handleTimeInputChange("start", e.target.value)}
                      placeholder="00:05:517"
                      className="text-center font-mono bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 hover:bg-gray-750 hover:border-gray-600"
                    />
                  </div>
                </div>
                
                {/* End Time */}
                <div className="space-y-3">
                  <Label htmlFor="end-time" className="text-sm font-medium text-gray-300">
                    End Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="end-time"
                      type="text"
                      value={formatTimeForInput(endTime)}
                      onChange={(e) => handleTimeInputChange("end", e.target.value)}
                      placeholder="01:25:120"
                      className="text-center font-mono bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 hover:bg-gray-750 hover:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}