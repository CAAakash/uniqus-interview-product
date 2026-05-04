export type Unit = "abs" | "lakh" | "crore";

export function fmt(value: number | null | undefined, unit: Unit = "lakh"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value === 0) return "—";
  // values are stored in INR thousands ('000)
  let v = value;
  let suffix = "";
  if (unit === "abs") {
    v = value * 1000;
  } else if (unit === "lakh") {
    v = value / 100; // '000 → lakhs
    suffix = "";
  } else if (unit === "crore") {
    v = value / 10000; // '000 → crores
    suffix = "";
  }
  const negative = v < 0;
  const abs = Math.abs(v);
  const fixed = unit === "abs" ? abs.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const out = `${fixed}${suffix}`;
  return negative ? `(${out})` : out;
}

export const unitLabel: Record<Unit, string> = {
  abs: "₹ Absolute",
  lakh: "₹ Lakhs",
  crore: "₹ Crores",
};

export const unitShort: Record<Unit, string> = {
  abs: "₹",
  lakh: "₹ L",
  crore: "₹ Cr",
};
