import { BASE_COURSES } from "@/data/courses";
import { DEPARTMENTS, HANDBOOK_COURSES, NON_GPA_CODES } from "@/data/departments";

// Grading system, FAS Student Handbook 2022/23 §8.10.2.
export const GRADES = [
  { grade: "A+", points: 4.0 },
  { grade: "A", points: 4.0 },
  { grade: "A-", points: 3.7 },
  { grade: "B+", points: 3.3 },
  { grade: "B", points: 3.0 },
  { grade: "B-", points: 2.7 },
  { grade: "C+", points: 2.3 },
  { grade: "C", points: 2.0 },
  { grade: "C-", points: 1.7 },
  { grade: "D+", points: 1.3 },
  { grade: "D", points: 1.0 },
  { grade: "E", points: 0.0 },
];
export const GRADE_POINTS = Object.fromEntries(GRADES.map((g) => [g.grade, g.points]));

// Minimum GPA for each class (Handbook §8.11). Other conditions (minimum grades, credits,
// attempts) also apply, so the app only says which band a GPA falls in.
export const CLASSES = [
  { min: 3.7, label: "First Class" },
  { min: 3.3, label: "Second Class (Upper)" },
  { min: 3.0, label: "Second Class (Lower)" },
  { min: 2.0, label: "Pass" },
];

export const YEARS = [1, 2, 3, 4];
export const SEMESTERS = [1, 2];
export const ROMAN = { 1: "I", 2: "II" };

const CODE_RE = /^([A-Z]{3})\s?(\d)(\d)(\d{2})$/;

export function normalizeCode(raw) {
  return String(raw || "").toUpperCase().replace(/\s+/g, "");
}

export function parseCode(raw) {
  const m = normalizeCode(raw).match(CODE_RE);
  if (!m) return null;
  return { prefix: m[1], year: Number(m[2]), credits: Number(m[3]) };
}

/** Code with the space the handbook prints: "ICT 1407". */
export function displayCode(code) {
  const c = normalizeCode(code);
  return CODE_RE.test(c) ? `${c.slice(0, 3)} ${c.slice(3)}` : c;
}

export function isNonGpaCode(code) {
  return NON_GPA_CODES.includes(normalizeCode(code));
}

/** Credit rating = second digit of the code (Handbook §8.6); non-GPA courses carry 0. */
export function creditsFor(code) {
  if (isNonGpaCode(code)) return 0;
  return parseCode(code)?.credits ?? 0;
}

const CATALOGUE = (() => {
  const map = new Map();
  for (const c of [...BASE_COURSES, ...HANDBOOK_COURSES]) {
    if (!map.has(c.code)) map.set(c.code, c);
  }
  return map;
})();

export const ALL_COURSES = [...CATALOGUE.values()];

export function findCourse(code) {
  return CATALOGUE.get(normalizeCode(code)) || null;
}

export function getDepartment(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}

function toCourse(c, extra = {}) {
  const nonGpa = extra.nonGpa ?? isNonGpaCode(c.code);
  return {
    code: c.code,
    title: c.title,
    year: c.year,
    semester: c.semester,
    estimated: Boolean(c.estimated),
    credits: extra.credits ?? creditsFor(c.code),
    nonGpa,
    custom: Boolean(extra.custom),
    // Courses the EIS import added (ids "eis-<code>") came from the EIS, not from the student.
    fromEis: Boolean(extra.custom) && String(extra.id || "").startsWith("eis-"),
    id: extra.id || c.code,
  };
}

/** The label for a course the student can delete: where it came from. */
export function customOrigin(course) {
  if (!course.custom) return null;
  return course.fromEis ? "Added from EIS" : "Added by you";
}

/**
 * The course list for a department, with the student's own changes applied:
 * subjects switched off, courses moved to the other semester, hidden or added.
 */
export function buildCourses(dept, data) {
  const enabled = new Set(data.subjects ?? dept.subjects.map((s) => s.prefix));
  const shared = new Set(dept.shared);
  const courses = [];
  for (const c of CATALOGUE.values()) {
    const prefix = c.code.slice(0, 3);
    const own = dept.subjects.some((s) => s.prefix === prefix);
    if ((own && enabled.has(prefix)) || shared.has(c.code)) courses.push(toCourse(c));
  }
  for (const c of data.custom || []) {
    courses.push(toCourse(c, { credits: Number(c.credits) || 0, nonGpa: Boolean(c.nonGpa), custom: true, id: c.id }));
  }
  const moved = data.moved || {};
  for (const c of courses) {
    if (moved[c.id]) c.semester = moved[c.id];
  }
  courses.sort((a, b) => (a.nonGpa === b.nonGpa ? a.code.localeCompare(b.code) : a.nonGpa ? -1 : 1));
  return courses;
}

// A grade below C is "referred": the student may re-sit, and the best grade on a re-sit is capped at C
// (Handbook §8.10.5). Class and degree criteria count credits with C or better (§8.11), so credit is
// "earned" from C up. The GPA still includes every graded course, an E included (§8.10.3 worked example).
export const EARN_MIN_POINTS = 2.0;

export function earnsCredit(grade) {
  return grade in GRADE_POINTS && GRADE_POINTS[grade] >= EARN_MIN_POINTS;
}

/**
 * Credit-weighted mean, truncated to two decimals without rounding (Handbook §8.10.3).
 * `credits` counts every graded GPA course; `earned` only those with C or better; `below` is how many
 * graded GPA courses sit below C (`failed` of those are E); `pending` is GPA courses with no grade yet.
 */
export function computeGpa(courses, grades) {
  let credits = 0;
  let points = 0;
  let graded = 0;
  let earned = 0;
  let below = 0;
  let failed = 0;
  let pending = 0;
  for (const c of courses) {
    const counts = !c.nonGpa && c.credits > 0;
    const g = grades[c.id];
    if (!g || !(g in GRADE_POINTS)) {
      if (counts) pending += 1;
      continue;
    }
    graded += 1;
    if (!counts) continue;
    credits += c.credits;
    points += GRADE_POINTS[g] * c.credits;
    if (earnsCredit(g)) earned += c.credits;
    else {
      below += 1;
      if (g === "E") failed += 1;
    }
  }
  const gpa = credits > 0 ? truncate2(points / credits) : null;
  return { gpa, credits, points, graded, earned, below, failed, pending };
}

/** The first semester that still has GPA courses without a grade, or null when every semester is done. */
export function firstIncompleteTerm(terms) {
  return terms.find((t) => t.pending > 0) ?? null;
}

export function truncate2(n) {
  return Math.floor(n * 100 + 1e-9) / 100;
}

export function formatGpa(gpa) {
  return gpa == null ? "—" : gpa.toFixed(2);
}

export function classFor(gpa) {
  if (gpa == null) return null;
  return CLASSES.find((c) => gpa >= c.min) || { min: 0, label: "Below pass" };
}

/** The next class band above this GPA and how far away it is. */
export function nextClass(gpa) {
  if (gpa == null) return null;
  const above = [...CLASSES].reverse().find((c) => c.min > gpa);
  return above ? { ...above, gap: truncate2(above.min - gpa + 1e-9) } : null;
}

/** Semester and cumulative GPA for every term, in order (Y1 S1 … Y4 S2). */
export function computeTerms(active, grades, maxYear = 4) {
  const list = [];
  for (const y of YEARS.filter((yr) => yr <= maxYear)) {
    for (const s of SEMESTERS) {
      const inTerm = active.filter((c) => c.year === y && c.semester === s);
      const upTo = active.filter((c) => c.year < y || (c.year === y && c.semester <= s));
      list.push({ year: y, semester: s, ...computeGpa(inTerm, grades), cumulative: computeGpa(upTo, grades).gpa });
    }
  }
  return list;
}

/** Latest academic year with a grade, so restored or reopened data lands where the student left off. */
export function latestGradedYear(deptData) {
  const years = Object.keys(deptData?.grades || {})
    .map((code) => Number(code.match(/\d/)?.[0] || 1))
    .filter((y) => y >= 1 && y <= 4);
  return years.length ? Math.max(...years) : 1;
}

/** Years a degree track counts: a BSc is three years, BSc Honours four. No choice yet counts all four. */
export function trackYears(track) {
  return track === "bsc" ? 3 : 4;
}

/** The courses that count toward the GPA for the chosen track (a BSc leaves out Year 4). */
export function countedCourses(courses, track) {
  const max = trackYears(track);
  return max >= 4 ? courses : courses.filter((c) => c.year <= max);
}
