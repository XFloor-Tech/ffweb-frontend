type ParseResult =
  | { kind: "empty" }
  | { kind: "intermediate" }
  | { kind: "invalid" }
  | { kind: "number"; value: number };

type PostElementMeasurementElements = {
  input: HTMLInputElement;
  measure: HTMLSpanElement;
  post: HTMLSpanElement;
};

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

  if (raw.endsWith(".") && /^[-+]?\d+(?:\.)$/.test(raw)) {
    return { kind: "intermediate" };
  }

  if (!/^[-+]?\d*(?:\.\d*)?$/.test(raw)) {
    return { kind: "invalid" };
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) return { kind: "invalid" };

  return { kind: "number", value };
};

const sanitizeAndParseNumberInput = (raw: string) => {
  const sanitized = sanitizeNumberText(raw);
  const parsed = parseNumberInput(sanitized);

  return {
    sanitized,
    parsed,
  };
};

const resolveLineHeight = (lineHeightRaw: string, fontSizePx: number) => {
  if (lineHeightRaw === "normal") {
    return fontSizePx * 1.2;
  }

  return Number.parseFloat(lineHeightRaw) || fontSizePx * 1.2;
};

const updatePostElementPosition = ({
  input,
  measure,
  post,
}: PostElementMeasurementElements) => {
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
  const lineHeightPx = resolveLineHeight(styles.lineHeight, fontSizePx);
  const contentHeight = Math.max(
    0,
    input.clientHeight - paddingTopPx - paddingBottomPx,
  );
  const textCenterOffset = contentHeight > 0 ? contentHeight / 2 : lineHeightPx / 2;
  const gapPx = Math.max(2, fontSizePx * 0.125);

  post.style.left = `${borderLeftPx + paddingLeftPx + valueRect.width + gapPx}px`;
  post.style.top = `${borderTopPx + paddingTopPx + textCenterOffset}px`;
};

export {
  clampNumber,
  formatNumber,
  isTextAllowedForStep,
  normalizeStepResult,
  parseNumberInput,
  sanitizeAndParseNumberInput,
  sanitizeNumberText,
  updatePostElementPosition,
};
