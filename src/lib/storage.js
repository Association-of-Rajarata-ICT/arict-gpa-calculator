// Everything a student enters stays in this browser's localStorage. Nothing is sent anywhere.
const KEY = "arict-gpa:v1";

export const EMPTY_STATE = { version: 1, dept: null, data: {} };

export const EMPTY_DEPT_DATA = { grades: {}, moved: {}, hidden: [], custom: [], subjects: null };

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    return sanitize(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Accepts a parsed backup (or stored value) and keeps only the fields the app understands. */
export function sanitize(input) {
  if (!input || typeof input !== "object" || typeof input.data !== "object" || input.data === null) {
    throw new Error("Not an ARICT GPA backup file.");
  }
  const data = {};
  for (const [dept, d] of Object.entries(input.data)) {
    if (!d || typeof d !== "object") continue;
    data[dept] = {
      grades: isPlainObject(d.grades) ? d.grades : {},
      moved: isPlainObject(d.moved) ? d.moved : {},
      hidden: Array.isArray(d.hidden) ? d.hidden.filter((x) => typeof x === "string") : [],
      custom: Array.isArray(d.custom) ? d.custom.filter((c) => c && typeof c.id === "string") : [],
      subjects: Array.isArray(d.subjects) ? d.subjects : null,
    };
  }
  return { version: 1, dept: typeof input.dept === "string" ? input.dept : null, data };
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
