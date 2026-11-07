// Everything a student enters stays in this browser's localStorage. Nothing is sent anywhere.
const KEY = "arict-gpa:v1";

export const EMPTY_STATE = { version: 1, dept: null, data: {} };

// track is the degree ("bsc" 3 years, "hons" 4 years, null until chosen); goal and targets belong
// to the next-class planner: the class aimed for and the grades planned for remaining courses.
export const EMPTY_DEPT_DATA = { grades: {}, eisGrades: {}, moved: {}, hidden: [], custom: [], subjects: null, track: null, goal: null, targets: {} };

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
      eisGrades: isPlainObject(d.eisGrades) ? d.eisGrades : {},
      moved: isPlainObject(d.moved) ? d.moved : {},
      hidden: Array.isArray(d.hidden) ? d.hidden.filter((x) => typeof x === "string") : [],
      custom: Array.isArray(d.custom) ? d.custom.filter((c) => c && typeof c.id === "string") : [],
      subjects: Array.isArray(d.subjects) ? d.subjects : null,
      track: d.track === "bsc" || d.track === "hons" ? d.track : null,
      goal: typeof d.goal === "string" ? d.goal : null,
      targets: isPlainObject(d.targets) ? d.targets : {},
    };
  }
  return { version: 1, dept: typeof input.dept === "string" ? input.dept : null, data };
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Name and registration number for the PDF report and EIS connection, remembered on this device only.
const PROFILE_KEY = "arict-gpa:profile";

export function loadProfile() {
  try {
    const p = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || "{}");
    return {
      name: typeof p.name === "string" ? p.name : "",
      regNo: typeof p.regNo === "string" ? p.regNo : "",
      isEis: Boolean(p.isEis),
      lastSync: typeof p.lastSync === "string" ? p.lastSync : null,
    };
  } catch {
    return { name: "", regNo: "", isEis: false, lastSync: null };
  }
}

export function saveProfile({ name = "", regNo = "", isEis = false, lastSync = null }) {
  try {
    const existing = loadProfile();
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        name: name || existing.name || "",
        regNo: regNo || existing.regNo || "",
        isEis: isEis !== undefined ? isEis : (existing.isEis || false),
        lastSync: lastSync || existing.lastSync || new Date().toISOString(),
      })
    );
  } catch {}
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {}
}
