import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import type {
  NumberInputControllerParams,
  NumberInputControllerResult,
  NumberInputPostElementRefs,
  NumberInputPostPositionParams,
  StepDirection,
} from "./types";
import {
  clampNumber,
  formatNumber,
  isTextAllowedForStep,
  normalizeStepResult,
  parseNumberInput,
  sanitizeAndParseNumberInput,
  updatePostElementPosition,
} from "./utils";

const useNumberInputController = ({
  value,
  defaultValue,
  onValueChange,
  onBlur,
  onFocus,
  onChange,
  onKeyDown,
  step,
  min,
  max,
  disabled,
}: NumberInputControllerParams): NumberInputControllerResult => {
  const isControlled = value !== undefined;

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

  const commitValue = (nextValue: number) => {
    const clamped = clampNumber(nextValue, min, max);

    if (!isControlled) {
      setUncontrolledValue(clamped);
    }

    setTextValue(formatNumber(clamped));
    onValueChange?.(clamped);
  };

  const resolveStepBaseValue = () => {
    const parsed = parseNumberInput(displayValue);
    if (parsed.kind === "number") {
      return parsed.value;
    }

    return resolvedValue;
  };

  const applyStep = (direction: StepDirection) => {
    const nextValue = resolveStepBaseValue() + direction * step;
    commitValue(normalizeStepResult(nextValue, step));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      applyStep(1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      applyStep(-1);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setTextValue(displayValue);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);

    const { parsed } = sanitizeAndParseNumberInput(event.target.value);
    if (parsed.kind === "number") {
      commitValue(parsed.value);
    } else {
      setTextValue(formatNumber(resolvedValue));
    }

    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);

    const { sanitized, parsed } = sanitizeAndParseNumberInput(
      event.target.value,
    );

    if (!isTextAllowedForStep(sanitized, step) || parsed.kind === "invalid") {
      return;
    }

    if (parsed.kind !== "number") {
      setTextValue(sanitized);
      return;
    }

    const clamped = clampNumber(parsed.value, min, max);
    if (clamped !== parsed.value) {
      return;
    }

    setTextValue(sanitized);

    if (!isControlled) {
      setUncontrolledValue(parsed.value);
    }

    onValueChange?.(parsed.value);
  };

  return {
    displayValue,
    canDecrement: !disabled && (typeof min !== "number" || resolvedValue > min),
    canIncrement: !disabled && (typeof max !== "number" || resolvedValue < max),
    handleBlur,
    handleFocus,
    handleChange,
    handleKeyDown,
    applyStep,
  };
};

const useNumberInputPostElement = ({
  enabled,
  displayValue,
  disabled,
}: NumberInputPostPositionParams): NumberInputPostElementRefs => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const postElementRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const input = inputRef.current;
    const measure = measureRef.current;
    const post = postElementRef.current;

    if (!input || !measure || !post) return;

    const updatePosition = () => {
      updatePostElementPosition({ input, measure, post });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(input);

    window.addEventListener("resize", updatePosition);

    let isMounted = true;
    document.fonts?.ready?.then(() => {
      if (isMounted) {
        updatePosition();
      }
    });

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [disabled, displayValue, enabled]);

  return {
    inputRef,
    measureRef,
    postElementRef,
  };
};

export { useNumberInputController, useNumberInputPostElement };
