import { type FC } from "react";

import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useNumberInputController, useNumberInputPostElement } from "./hooks";
import type { NumberInputProps } from "./types";
import { parseNumberInput } from "./utils";

const NumberInput: FC<NumberInputProps> = ({
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
  const {
    displayValue,
    canDecrement,
    canIncrement,
    handleBlur,
    handleChange,
    handleFocus,
    handleKeyDown,
    applyStep,
  } = useNumberInputController({
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
  });

  const shouldShowPostElement =
    !!postElement && parseNumberInput(displayValue).kind === "number";

  const { inputRef, measureRef, postElementRef } = useNumberInputPostElement({
    enabled: shouldShowPostElement,
    displayValue,
    disabled,
  });

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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
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
        <Button
          type="button"
          variant="number"
          size="icon-sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyStep(-1)}
          disabled={!canDecrement}
          aria-label="Decrement"
        >
          <MinusIcon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="number"
          size="icon-sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyStep(1)}
          disabled={!canIncrement}
          aria-label="Increment"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export { NumberInput };
