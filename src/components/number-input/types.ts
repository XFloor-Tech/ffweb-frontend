import type {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from "react";

import type { Input } from "@/components/ui/input";

type NumberInputProps = Omit<
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

type NumberInputControllerParams = Pick<
  NumberInputProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onBlur"
  | "onFocus"
  | "onChange"
  | "onKeyDown"
  | "min"
  | "max"
  | "disabled"
> & {
  step: number;
};

type StepDirection = 1 | -1;

type NumberInputControllerResult = {
  displayValue: string;
  canDecrement: boolean;
  canIncrement: boolean;
  handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
  handleFocus: (event: FocusEvent<HTMLInputElement>) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  applyStep: (direction: StepDirection) => void;
};

type NumberInputPostPositionParams = {
  enabled: boolean;
  displayValue: string;
  disabled?: boolean;
};

type NumberInputPostElementRefs = {
  inputRef: RefObject<HTMLInputElement | null>;
  measureRef: RefObject<HTMLSpanElement | null>;
  postElementRef: RefObject<HTMLSpanElement | null>;
};

export type {
  NumberInputControllerParams,
  NumberInputControllerResult,
  NumberInputPostElementRefs,
  NumberInputPostPositionParams,
  NumberInputProps,
  StepDirection,
};
