import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type FC,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { MinusIcon, PlusIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  clampNumber,
  formatNumber,
  isTextAllowedForStep,
  normalizeStepResult,
  parseNumberInput,
  sanitizeNumberText,
} from "./utils";

type Props = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  postElement?: ReactNode;
  label?: ReactNode;
};

const NumberInput: FC<Props> = ({
  className,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  onFocus,
  onChange,
  onKeyDown,
  step = 1,
  min,
  max,
  postElement,
  disabled,
  label,
  ...props
}) => {
  const isControlled = value !== undefined;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const postElementRef = useRef<HTMLSpanElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(() =>
    clampNumber(defaultValue ?? 0, min, max),
  );
  const [textValue, setTextValue] = useState<string>(() =>
    formatNumber(value ?? defaultValue ?? 0),
  );

  const resolvedValue = isControlled
    ? clampNumber(value ?? 0, min, max)
    : uncontrolledValue;

  const displayValue = isEditing ? textValue : formatNumber(resolvedValue);
  const shouldShowPostElement =
    !!postElement && parseNumberInput(displayValue).kind === "number";

  useLayoutEffect(() => {
    if (!shouldShowPostElement) return;
    if (typeof window === "undefined") return;

    const input = inputRef.current;
    const measure = measureRef.current;
    const post = postElementRef.current;

    if (!input || !measure || !post) return;

    const updatePostPosition = () => {
      const styles = window.getComputedStyle(input);

      measure.style.font = styles.font;
      measure.style.letterSpacing = styles.letterSpacing;
      measure.style.textTransform = styles.textTransform;
      measure.style.lineHeight = styles.lineHeight;

      post.style.font = styles.font;
      post.style.letterSpacing = styles.letterSpacing;
      post.style.textTransform = styles.textTransform;
      post.style.lineHeight = styles.lineHeight;
      post.style.color = styles.color;
      post.style.opacity = styles.opacity;

      const valueRect = measure.getBoundingClientRect();
      const paddingLeftPx = Number.parseFloat(styles.paddingLeft) || 0;
      const borderLeftPx = Number.parseFloat(styles.borderLeftWidth) || 0;
      const paddingTopPx = Number.parseFloat(styles.paddingTop) || 0;
      const paddingBottomPx = Number.parseFloat(styles.paddingBottom) || 0;
      const borderTopPx = Number.parseFloat(styles.borderTopWidth) || 0;
      const fontSizePx = Number.parseFloat(styles.fontSize) || 16;
      const lineHeightRaw = styles.lineHeight;
      const lineHeightPx =
        lineHeightRaw === "normal"
          ? fontSizePx * 1.2
          : Number.parseFloat(lineHeightRaw) || fontSizePx * 1.2;
      const contentHeight = Math.max(
        0,
        input.clientHeight - paddingTopPx - paddingBottomPx,
      );
      const textCenterOffset =
        contentHeight > 0 ? contentHeight / 2 : lineHeightPx / 2;
      const gapPx = Math.max(2, fontSizePx * 0.125);

      post.style.left = `${borderLeftPx + paddingLeftPx + valueRect.width + gapPx}px`;
      post.style.top = `${borderTopPx + paddingTopPx + textCenterOffset}px`;
    };

    updatePostPosition();

    const resizeObserver = new ResizeObserver(updatePostPosition);
    resizeObserver.observe(input);

    const handleResize = () => updatePostPosition();
    window.addEventListener("resize", handleResize);

    let isActive = true;
    document.fonts.ready.then(() => {
      if (!isActive) return;
      updatePostPosition();
    });

    return () => {
      isActive = false;
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [disabled, displayValue, shouldShowPostElement]);

  const commitValue = (nextValue: number) => {
    const clamped = clampNumber(nextValue, min, max);

    if (!isControlled) {
      setUncontrolledValue(clamped);
    }

    setTextValue(formatNumber(clamped));
    onValueChange?.(clamped);
  };

  const increment = () => {
    const parsed = parseNumberInput(displayValue);

    if (parsed.kind === "number") {
      commitValue(normalizeStepResult(parsed.value + step, step));
      return;
    }

    commitValue(normalizeStepResult(resolvedValue + step, step));
  };

  const decrement = () => {
    const parsed = parseNumberInput(displayValue);

    if (parsed.kind === "number") {
      commitValue(normalizeStepResult(parsed.value - step, step));
      return;
    }

    commitValue(normalizeStepResult(resolvedValue - step, step));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (disabled) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      increment();
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      decrement();
    }
  };

  const canDecrement =
    !disabled && (typeof min !== "number" || resolvedValue > min);
  const canIncrement =
    !disabled && (typeof max !== "number" || resolvedValue < max);

  return (
    <div className="relative">
      {label && (
        <span className="pointer-events-none absolute top-2 left-3 text-mini text-primary select-none">
          {label}
        </span>
      )}

      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        disabled={disabled}
        className={cn("pt-6 pr-28 pb-2", className)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          setIsEditing(true);
          setTextValue(displayValue);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsEditing(false);

          const sanitized = sanitizeNumberText(event.target.value);
          const parsed = parseNumberInput(sanitized);
          if (parsed.kind === "number") {
            commitValue(parsed.value);
          } else {
            setTextValue(formatNumber(resolvedValue));
          }

          onBlur?.(event);
        }}
        onChange={(event) => {
          onChange?.(event);
          const sanitized = sanitizeNumberText(event.target.value);
          if (!isTextAllowedForStep(sanitized, step)) return;

          const parsed = parseNumberInput(sanitized);
          if (parsed.kind === "invalid") return;

          if (parsed.kind !== "number") {
            setTextValue(sanitized);
            return;
          }

          const clamped = clampNumber(parsed.value, min, max);
          if (clamped !== parsed.value) return;

          setTextValue(sanitized);
          if (!isControlled) {
            setUncontrolledValue(parsed.value);
          }
          onValueChange?.(parsed.value);
        }}
        {...props}
      />

      <span
        ref={measureRef}
        className="invisible absolute top-0 left-0 whitespace-pre"
      >
        {displayValue}
      </span>

      {shouldShowPostElement && (
        <span
          ref={postElementRef}
          className="pointer-events-none absolute -translate-y-1/2 select-none"
        >
          {postElement}
        </span>
      )}

      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
        <button
          type="button"
          className={cn(
            "text-text inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={decrement}
          disabled={!canDecrement}
          aria-label="Decrement"
        >
          <MinusIcon className="size-4" />
        </button>

        <button
          type="button"
          className={cn(
            "text-text inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={increment}
          disabled={!canIncrement}
          aria-label="Increment"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  );
};

export { NumberInput };
