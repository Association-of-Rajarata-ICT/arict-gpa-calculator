// Next-class planner: what GPA the remaining courses need for each degree class, and a suggested
// grade for every remaining course. GPA cut-offs only; the handbook's minimum-grade rules also apply.
import { CLASSES, GRADE_POINTS, GRADES, truncate2 } from "@/lib/gpa";

export const TRACKS = {
  bsc: { id: "bsc", label: "BSc", long: "BSc (3 years)", years: 3, credits: 90 },
  hons: { id: "hons", label: "BSc Honours", long: "BSc Honours (4 years)", years: 4, credits: 120 },
};

// Grades the planner will suggest, lowest first. It never plans a grade below C.
const PLAN_GRADES = GRADES.filter((g) => g.grade !== "A+" && g.points >= 2)
  .map((g) => g.grade)
  .reverse(); // C, C+, B-, B, B+, A-, A

const counts = (c) => !c.nonGpa && c.credits > 0;

// The grade, or grades, an average sits between, in words: 3.42 -> "B+ to A-".
export function gradeWords(avg) {
  if (avg == null) return "";
  const list = GRADES.filter((g) => g.grade !== "A+");
  const exact = list.find((g) => Math.abs(g.points - avg) < 0.005);
  if (exact) return exact.grade;
  const above = [...list].reverse().find((g) => g.points > avg);
  const below = list.find((g) => g.points < avg);
  if (!above) return "A";
  if (!below) return above.grade;
  return `${below.grade} to ${above.grade}`;
}

/**
 * @param courses active (not hidden) courses for the department
 * @param grades  { courseId: grade }
 * @param track   "bsc" | "hons"
 * @param targets { courseId: grade } the student's own planned grades for remaining courses
 * @param goalLabel class label the student is aiming for (defaults to the next class up)
 */
export function buildPlan({ courses, grades, track = "hons", targets = {}, goalLabel = null }) {
  const t = TRACKS[track] || TRACKS.hons;
  const inScope = courses.filter((c) => c.year <= t.years && counts(c));
  const done = inScope.filter((c) => grades[c.id] in GRADE_POINTS);
  const remaining = inScope.filter((c) => !(grades[c.id] in GRADE_POINTS));

  const doneCredits = done.reduce((s, c) => s + c.credits, 0);
  const donePoints = done.reduce((s, c) => s + GRADE_POINTS[grades[c.id]] * c.credits, 0);
  const remCredits = remaining.reduce((s, c) => s + c.credits, 0);
  const totalCredits = doneCredits + remCredits;
  const current = doneCredits ? truncate2(donePoints / doneCredits) : null;
  const best = totalCredits ? truncate2((donePoints + 4 * remCredits) / totalCredits) : null;
  const worst = totalCredits && remCredits ? truncate2((donePoints + 2 * remCredits) / totalCredits) : current;

  // For each class: the average the remaining credits need to finish at or above its cut-off.
  const ladder = CLASSES.map((c) => {
    const need = remCredits ? (c.min * totalCredits - donePoints) / remCredits : null;
    let status;
    if (!remCredits) status = current != null && current >= c.min ? "secured" : "missed";
    else if (need <= 2 + 1e-9) status = "secured"; // C in everything still gets there
    else if (need > 4 + 1e-9) status = "out";
    else status = "possible";
    // Round the needed average up, so following it never falls short after truncation.
    const needUp = need == null ? null : Math.ceil(need * 100 - 1e-9) / 100;
    return { ...c, need: needUp, status, words: status === "possible" ? gradeWords(needUp) : "" };
  });

  const currentClass = current != null ? CLASSES.find((c) => current >= c.min) ?? null : null;
  // Default goal: the lowest class above where the student is now that is still reachable.
  const reachable = ladder.filter((l) => l.status === "possible" || l.status === "secured");
  // With nothing graded yet, aim for First Class; the student can pick any other.
  const defaultGoal = !doneCredits
    ? ladder[0]
    : ([...reachable].reverse().find((l) => !currentClass || l.min > currentClass.min) ?? reachable[0] ?? ladder[ladder.length - 1]);
  const goal = ladder.find((l) => l.label === goalLabel && l.status !== "out") ?? defaultGoal;

  // 1. Initial baseline suggestion when nothing is manually pinned
  const baselineTarget = goal ? goal.min * totalCredits - donePoints : 0;
  const suggested = suggestGrades(remaining, baselineTarget);

  // 2. Separate user-pinned targets from unpinned courses that dynamically adapt
  const isPinned = (c) => Boolean(targets && targets[c.id] in GRADE_POINTS);
  const pinned = remaining.filter(isPinned);
  const unpinned = remaining.filter((c) => !isPinned(c));

  // 3. Points committed by past grades and user-pinned targets
  const pinnedPoints = pinned.reduce((s, c) => s + GRADE_POINTS[targets[c.id]] * c.credits, 0);
  const neededFromUnpinned = goal ? goal.min * totalCredits - (donePoints + pinnedPoints) : 0;

  // 4. Adapt unpinned courses so the overall target plan is maintained
  const adapted = suggestGrades(unpinned, neededFromUnpinned);

  // Final planned grades: pinned targets for user-chosen courses, adapted grades for the rest
  const planned = Object.fromEntries(
    remaining.map((c) => [c.id, isPinned(c) ? targets[c.id] : (adapted[c.id] ?? suggested[c.id])])
  );
  const plannedPoints = remaining.reduce((s, c) => s + GRADE_POINTS[planned[c.id]] * c.credits, 0);
  const projected = totalCredits ? truncate2((donePoints + plannedPoints) / totalCredits) : null;
  const projectedClass = projected != null ? CLASSES.find((c) => projected >= c.min) ?? null : null;
  const edited = pinned.length > 0;
  const pinnedIds = new Set(pinned.map((c) => c.id));

  return {
    track: t,
    current,
    currentClass,
    best,
    worst,
    doneCredits,
    remCredits,
    totalCredits,
    remaining,
    ladder,
    goal,
    suggested,
    planned,
    projected,
    projectedClass,
    edited,
    pinnedIds,
  };
}

// The gentlest plan that reaches the target points: one grade for most courses, a step higher on the
// courses with the most credits (they move the GPA most), never below C.
function suggestGrades(remaining, targetPoints) {
  const out = {};
  if (!remaining.length) return out;
  const target = Math.max(0, targetPoints - 1e-9);
  const points = (plan) => remaining.reduce((s, c) => s + GRADE_POINTS[PLAN_GRADES[plan[c.id]]] * c.credits, 0);

  // Uniform base: the highest grade that does not yet reach the goal (or C if C already does).
  let base = 0;
  while (base < PLAN_GRADES.length - 1) {
    const plan = Object.fromEntries(remaining.map((c) => [c.id, base]));
    if (points(plan) >= target) break;
    base += 1;
  }
  const plan = Object.fromEntries(remaining.map((c) => [c.id, Math.max(0, base - 1)]));
  if (base === 0 || points(plan) >= target) {
    remaining.forEach((c) => (out[c.id] = PLAN_GRADES[base === 0 ? 0 : plan[c.id]]));
    return out;
  }
  // Lift courses one step, biggest credits first (earliest year breaks ties), until the goal is met.
  const order = [...remaining].sort((a, b) => b.credits - a.credits || a.year - b.year || a.semester - b.semester);
  for (const c of order) {
    if (points(plan) >= target) break;
    plan[c.id] = Math.min(PLAN_GRADES.length - 1, plan[c.id] + 1);
  }
  remaining.forEach((c) => (out[c.id] = PLAN_GRADES[plan[c.id]]));
  return out;
}
