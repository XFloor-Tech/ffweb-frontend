type ParseResult =
  | { kind: "empty" }
  | { kind: "intermediate" }
  | { kind: "invalid" }
  | { kind: "number"; value: number };

const MAX_FORMAT_DECIMALS = 12;

const clampNumber = (value: number, min?: number, max?: number) => {
  let clamped = value;

  if (typeof min === "number") {
    clamped = Math.max(min, clamped);
  }

  if (typeof max === "number") {
    clamped = Math.min(max, clamped);
  }

  return clamped;
};

const countDecimalPlaces = (value: number) => {
  if (!Number.isFinite(value)) return 0;

  const stringValue = value.toString().toLowerCase();

  if (!stringValue.includes("e")) {
    const [, fraction = ""] = stringValue.split(".");
    return fraction.length;
  }

  const [basePart, exponentPart] = stringValue.split("e");
  const exponent = Number.parseInt(exponentPart ?? "0", 10);
  const [, baseFraction = ""] = basePart.split(".");

  return Math.max(0, baseFraction.length - exponent);
};

const normalizeStepResult = (value: number, step: number) => {
  if (!Number.isFinite(value)) return value;

  const precision = Math.max(0, countDecimalPlaces(step));
  if (precision === 0) return Math.round(value);

  return Number(value.toFixed(precision));
};

const isTextAllowedForStep = (raw: string, step: number) => {
  const precision = Math.max(0, countDecimalPlaces(step));
  const unsigned = raw.replace(/^[-+]/, "");
  const [integerPart = "", fractionalPart] = unsigned.split(".");

  if (integerPart.length > 1 && integerPart.startsWith("0")) {
    return false;
  }

  if (precision === 0 && raw.includes(".")) {
    return false;
  }

  if (fractionalPart !== undefined && fractionalPart.length > precision) {
    return false;
  }

  return true;
};

const formatNumber = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";

  const normalized = Number(value.toFixed(MAX_FORMAT_DECIMALS));
  return String(normalized);
};

const sanitizeNumberText = (raw: string) => {
  const allowed = raw.replace(/[^\d.+-]/g, "");

  let sign = "";
  let rest = allowed;

  if (rest.startsWith("-") || rest.startsWith("+")) {
    sign = rest[0];
    rest = rest.slice(1);
  }

  rest = rest.replace(/[+-]/g, "");

  const firstDotIndex = rest.indexOf(".");
  if (firstDotIndex === -1) return sign + rest;

  const beforeDot = rest.slice(0, firstDotIndex);
  const afterDot = rest.slice(firstDotIndex + 1).replace(/\./g, "");

  return sign + beforeDot + "." + afterDot;
};

const parseNumberInput = (raw: string): ParseResult => {
  if (raw === "") return { kind: "empty" };

  if (raw === "-" || raw === "+" || raw === "." || raw === "-." || raw === "+.")
    return { kind: "intermediate" };

  if (
    raw.endsWith(".") &&
    /^[-+]?\d+(?:\.)$/.test(raw)
  ) {
    return { kind: "intermediate" };
  }

  if (!/^[-+]?\d*(?:\.\d*)?$/.test(raw)) {
    return { kind: "invalid" };
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) return { kind: "invalid" };

  return { kind: "number", value };
};

export {
  clampNumber,
  formatNumber,
  isTextAllowedForStep,
  normalizeStepResult,
  parseNumberInput,
  sanitizeNumberText,
};
