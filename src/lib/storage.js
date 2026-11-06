// Everything a student enters stays in this browser's localStorage. Nothing is sent anywhere.
const KEY = "arict-gpa:v1";

export const EMPTY_STATE = { version: 1, dept: null, data: {} };

// track, goal and targets belong to the next-class planner: degree track, chosen class, planned grades.
export const EMPTY_DEPT_DATA = { grades: {}, moved: {}, hidden: [], custom: [], subjects: null, track: "hons", goal: null, targets: {} };

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
      track: d.track === "bsc" ? "bsc" : "hons",
      goal: typeof d.goal === "string" ? d.goal : null,
      targets: isPlainObject(d.targets) ? d.targets : {},
    };
  }
  return { version: 1, dept: typeof input.dept === "string" ? input.dept : null, data };
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Name and registration number for the PDF report, remembered on this device only.
const PROFILE_KEY = "arict-gpa:profile";

export function loadProfile() {
  try {
    const p = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || "{}");
    return { name: typeof p.name === "string" ? p.name : "", regNo: typeof p.regNo === "string" ? p.regNo : "" };
  } catch {
    return { name: "", regNo: "" };
  }
}

export function saveProfile({ name = "", regNo = "" }) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, regNo }));
  } catch {}
}
