type ParseResult =
  | { kind: "empty" }
  | { kind: "intermediate" }
  | { kind: "invalid" }
  | { kind: "number"; value: number };

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

const formatNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

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

export { clampNumber, formatNumber, parseNumberInput, sanitizeNumberText };
