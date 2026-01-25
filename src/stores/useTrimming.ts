// hooks/useTrimming.ts
import { useConversionStore } from '../stores/conversionStore';

export const useTrimming = () => {
  const {
    enableTrim,
    startTime,
    endTime,
    useCustomStart,
    useCustomEnd,
    duration,
    showTrimming,
    
    setEnableTrim,
    setStartTime,
    setEndTime,
    setUseCustomStart,
    setUseCustomEnd,
    clearTrimming,
    calculateDuration,
    toggleTrimming,
    timePresets,
    setTrimmingPreset,
    swapTimes,
  } = useConversionStore();
  
  // Parse times for easier manipulation
  const getTimeComponents = (timeStr: string) => {
    const parts = timeStr.split(/[:.]/);
    return {
      hours: parts.length === 4 ? parseInt(parts[0]) : 0,
      minutes: parts.length === 4 ? parseInt(parts[1]) : (parts.length === 3 ? parseInt(parts[0]) : 0),
      seconds: parts.length === 4 ? parseInt(parts[2]) : (parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0])),
      milliseconds: parts.length === 4 ? parseInt(parts[3]) : (parts.length === 3 ? parseInt(parts[2]) : parseInt(parts[1] || '0'))
    };
  };
  
  // Increment/decrement time
  const adjustTime = (timeField: 'startTime' | 'endTime', amountMs: number) => {
    const currentTime = timeField === 'startTime' ? startTime : endTime;
    const currentMs: any = parseTimeToMs(currentTime);
    const newMs = Math.max(0, currentMs + amountMs);
    const newTime: any = formatMsToTime(newMs);
    
    if (timeField === 'startTime') {
      setStartTime(newTime);
    } else {
      setEndTime(newTime);
    }
  };
  
  // Set to current playback position (if you have a player)
  const setToCurrentPosition = (currentTimeMs: number) => {
    if (useCustomStart) {
        //@ts-ignore
      setStartTime(formatMsToTime(currentTimeMs));
    } else if (useCustomEnd) {
        //@ts-ignore
      setEndTime(formatMsToTime(currentTimeMs));
    }
  };
  
  // Validate times
  const isValidTimes = () => {
    const startMs = parseTimeToMs(startTime);
    const endMs = parseTimeToMs(endTime);
    return endMs > startMs;
  };
  
  // Get FFmpeg trim filter string
  const getFFmpegTrimFilter = () => {
    if (!enableTrim || !isValidTimes()) return '';
    
    const startMs: any = parseTimeToMs(startTime);
    const endMs: any = parseTimeToMs(endTime);
    
    const startSec = startMs / 1000;
    const durationSec = (endMs - startMs) / 1000;
    
    return `atrim=start=${startSec}:duration=${durationSec}`;
  };
  
  return {
    // State
    enableTrim,
    startTime,
    endTime,
    useCustomStart,
    useCustomEnd,
    duration,
    showTrimming,
    timePresets,
    
    // Actions
    setEnableTrim,
    setStartTime,
    setEndTime,
    setUseCustomStart,
    setUseCustomEnd,
    clearTrimming,
    calculateDuration,
    toggleTrimming,
    setTrimmingPreset,
    swapTimes,
    
    // Helper functions
    adjustTime,
    setToCurrentPosition,
    isValidTimes,
    getFFmpegTrimFilter,
    getTimeComponents,
  };
};

function formatMsToTime(newMs: number) {
    throw new Error('Function not implemented.');
}
function parseTimeToMs(currentTime: string) {
    throw new Error('Function not implemented.');
}

