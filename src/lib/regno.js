// Faculty of Applied Sciences registration numbers: PREFIX/YEAR/NUMBER, e.g. ICT/2022/074.
// The prefix follows the student's stream; Chemical Sciences students come from either stream.
export const REG_PREFIXES = {
  it: ["ICT"],
  phy: ["ASP"],
  bio: ["ASB"],
  hp: ["HPT"],
  chem: ["ASP", "ASB"],
};

const PATTERN = /^\s*([A-Za-z]{3})\s*\/\s*(\d{4})\s*\/\s*(\d{1,3})\s*$/;

export function prefixesFor(deptId) {
  return REG_PREFIXES[deptId] ?? ["ICT", "ASP", "ASB", "HPT"];
}

// Reads "ICT/2022/074" (or "ict / 2022 / 74") into its parts; null if it isn't that shape.
export function parseRegNo(value) {
  const m = PATTERN.exec(value || "");
  if (!m) return null;
  return { prefix: m[1].toUpperCase(), year: m[2], number: m[3].padStart(3, "0") };
}

export function formatRegNo({ prefix, year, number }) {
  return `${prefix}/${year}/${String(number).padStart(3, "0")}`;
}

// Returns an error message, or null when the parts are empty (the field is optional) or valid.
export function regNoError({ year, number }) {
  if (!year && !number) return null;
  if (!/^20\d{2}$/.test(year)) return "Enter the intake year as four digits, like 2022.";
  if (!/^\d{1,3}$/.test(number) || Number(number) === 0) return "Enter your number, like 074.";
  return null;
}
