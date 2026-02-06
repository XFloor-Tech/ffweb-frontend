import { useEffect, useState, type FC } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useConversionStore } from "@/store/conversion-store";

import { Switch } from "../ui/switch";
import {
  formatTrimTimeForInput,
  msToTrimDisplay,
  normalizeTrimTimeInput,
  parseTrimTimeToMs,
} from "./utils";

const MAX_DURATION_MS = 300_000;

type Props = {
  className?: string;
};

const TrimmingSettings: FC<Props> = ({ className }) => {
  const {
    enableTrim,
    startTime,
    endTime,
    setEnableTrim,
    setStartTime,
    setEndTime,
  } = useConversionStore();

  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const startMs = parseTrimTimeToMs(startTime);
    const endMs = parseTrimTimeToMs(endTime);

    const validEndMs = endMs > startMs ? endMs : startMs + 1000;
    if (endMs <= startMs) {
      setEndTime(msToTrimDisplay(validEndMs));
    }

    // TODO: handle outside of use effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- later.
    setSliderRange([startMs, validEndMs]);
  }, [endTime, setEndTime, startTime]);

  const handleSliderChange = (value: number[]) => {
    if (value.length === 2) {
      const [newStart, newEnd] = value;

      if (newStart < newEnd) {
        setStartTime(msToTrimDisplay(newStart));
        setEndTime(msToTrimDisplay(newEnd));
      } else if (newStart >= newEnd) {
        setStartTime(msToTrimDisplay(newStart));
        setEndTime(msToTrimDisplay(newStart + 1000));
      }
    }
  };

  const handleTimeInputChange = (type: "start" | "end", value: string) => {
    const formatted = normalizeTrimTimeInput(value);

    if (type === "start") {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <Switch
          id="trim-enable"
          checked={enableTrim}
          onCheckedChange={(checked) => setEnableTrim(!!checked)}
        />

        <Label
          htmlFor="trim-enable"
          className="cursor-pointer text-small font-medium text-nowrap"
        >
          Trim:
        </Label>
      </div>

      {enableTrim && (
        <>
          {/* Visual Slider */}
          <div className="py-4">
            <Slider
              value={[sliderRange[0], sliderRange[1]]}
              onValueChange={handleSliderChange}
              min={0}
              max={MAX_DURATION_MS}
              step={100}
              className="w-full"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{msToTrimDisplay(0)}</span>
              <span>{msToTrimDisplay(MAX_DURATION_MS / 2)}</span>
              <span>{msToTrimDisplay(MAX_DURATION_MS)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-start gap-1">
              <div className="relative">
                <Input
                  id="start-time"
                  type="text"
                  value={formatTrimTimeForInput(startTime)}
                  onChange={(e) =>
                    handleTimeInputChange("start", e.target.value)
                  }
                  placeholder="00:05:517"
                  className="hover:bg-gray-750 h-9 w-30 border-gray-700 bg-gray-800 text-start font-mono text-white placeholder:text-gray-500 hover:border-gray-600"
                />
              </div>

              <Label htmlFor="start-time" className="text-small font-medium">
                Start Time
              </Label>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="relative">
                <Input
                  id="end-time"
                  type="text"
                  value={formatTrimTimeForInput(endTime)}
                  onChange={(e) => handleTimeInputChange("end", e.target.value)}
                  placeholder="01:25:120"
                  className="hover:bg-gray-750 h-9 w-30 border-gray-700 bg-gray-800 text-start font-mono text-white placeholder:text-gray-500 hover:border-gray-600"
                />
              </div>

              <Label htmlFor="end-time" className="text-small font-medium">
                End Time
              </Label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { TrimmingSettings };
