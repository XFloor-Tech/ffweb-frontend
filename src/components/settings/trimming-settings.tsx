import { useEffect, type FC } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useConversionStore } from "@/store/conversion-store";
import { useFileStore } from "@/store/file-store";

import { Switch } from "../ui/switch";
import { useSelectedFileDurationMs } from "./hooks";
import {
  formatTrimTimeForInput,
  msToTrimDisplay,
  normalizeTrimRange,
  normalizeTrimTimeInput,
  parseTrimTimeToMs,
} from "./utils";

const MIN_TRIM_SEGMENT_MS = 1000;

type Props = {
  className?: string;
};

const TrimmingSettings: FC<Props> = ({ className }) => {
  const selectedFile = useFileStore((state) => state.selectedFile);
  const {
    enableTrim,
    startTime,
    endTime,
    setEnableTrim,
    setStartTime,
    setEndTime,
  } = useConversionStore();

  const { durationMs: fileDurationMs, isLoading: isDurationLoading } =
    useSelectedFileDurationMs(selectedFile);

  const hasSelectedFile = !!selectedFile;
  const isDurationReady =
    typeof fileDurationMs === "number" && fileDurationMs > 0;
  const isTrimmingAvailable = hasSelectedFile && isDurationReady;

  const maxDurationMs = isDurationReady ? fileDurationMs : 0;
  const parsedStartMs = parseTrimTimeToMs(startTime);
  const parsedEndMs = parseTrimTimeToMs(endTime);
  const normalizedRange = normalizeTrimRange({
    startMs: parsedStartMs,
    endMs: parsedEndMs,
    maxDurationMs,
    minSegmentMs: MIN_TRIM_SEGMENT_MS,
  });

  useEffect(() => {
    if (isTrimmingAvailable || !enableTrim) {
      return;
    }

    setEnableTrim(false);
  }, [enableTrim, isTrimmingAvailable, setEnableTrim]);

  useEffect(() => {
    if (!isTrimmingAvailable) {
      return;
    }

    const nextStartTime = msToTrimDisplay(normalizedRange.startMs);
    const nextEndTime = msToTrimDisplay(normalizedRange.endMs);

    if (startTime !== nextStartTime) {
      setStartTime(nextStartTime);
    }

    if (endTime !== nextEndTime) {
      setEndTime(nextEndTime);
    }
  }, [
    endTime,
    isTrimmingAvailable,
    normalizedRange.endMs,
    normalizedRange.startMs,
    setEndTime,
    setStartTime,
    startTime,
  ]);

  const updateTrimRange = (nextStartMs: number, nextEndMs: number) => {
    if (!isTrimmingAvailable) {
      return;
    }

    const nextRange = normalizeTrimRange({
      startMs: nextStartMs,
      endMs: nextEndMs,
      maxDurationMs,
      minSegmentMs: MIN_TRIM_SEGMENT_MS,
    });

    setStartTime(msToTrimDisplay(nextRange.startMs));
    setEndTime(msToTrimDisplay(nextRange.endMs));
  };

  const handleSliderChange = (value: number[]) => {
    if (value.length !== 2) {
      return;
    }

    const [newStartMs, newEndMs] = value;
    updateTrimRange(newStartMs, newEndMs);
  };

  const handleTimeInputChange = (type: "start" | "end", value: string) => {
    const formatted = normalizeTrimTimeInput(value);
    const nextMs = parseTrimTimeToMs(formatted);

    if (type === "start") {
      updateTrimRange(nextMs, parsedEndMs);
      return;
    }

    updateTrimRange(parsedStartMs, nextMs);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <Switch
          id="trim-enable"
          checked={isTrimmingAvailable && enableTrim}
          onCheckedChange={(checked) => setEnableTrim(!!checked)}
          disabled={!isTrimmingAvailable}
        />

        <Label
          htmlFor="trim-enable"
          className={cn(
            "text-small font-medium text-nowrap",
            isTrimmingAvailable
              ? "cursor-pointer"
              : "cursor-not-allowed text-gray-400",
          )}
        >
          Trim:
        </Label>
      </div>

      {!hasSelectedFile && (
        <span className="text-xs text-gray-400">
          Select a file first to enable trimming options.
        </span>
      )}

      {hasSelectedFile && isDurationLoading && (
        <span className="text-xs text-gray-400">Reading file duration...</span>
      )}

      {hasSelectedFile && !isDurationLoading && !isDurationReady && (
        <span className="text-xs text-gray-400">
          Couldn&apos;t read this file duration, so trimming is unavailable.
        </span>
      )}

      {enableTrim && isTrimmingAvailable && (
        <>
          <div className="py-4">
            <Slider
              value={[normalizedRange.startMs, normalizedRange.endMs]}
              onValueChange={handleSliderChange}
              min={0}
              max={maxDurationMs}
              step={100}
              className="w-full"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{msToTrimDisplay(0)}</span>
              <span>{msToTrimDisplay(Math.floor(maxDurationMs / 2))}</span>
              <span>{msToTrimDisplay(maxDurationMs)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-start gap-1">
              <div className="relative">
                <Input
                  id="start-time"
                  type="text"
                  value={formatTrimTimeForInput(startTime)}
                  onChange={(event) =>
                    handleTimeInputChange("start", event.target.value)
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
                  onChange={(event) =>
                    handleTimeInputChange("end", event.target.value)
                  }
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
