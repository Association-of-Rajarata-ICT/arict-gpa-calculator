"use client";

import { useMemo } from "react";
import { ArrowUp, Check, Flag, GraduationCap, Lock, RotateCcw, Target, TrendingUp, X } from "lucide-react";
import { displayCode, formatGpa, GRADE_POINTS, GRADES, ROMAN } from "@/lib/gpa";
import { buildPlan } from "@/lib/planner";

const SHORT = { "First Class": "First Class", "Second Class (Upper)": "Second Upper", "Second Class (Lower)": "Second Lower", Pass: "Pass" };
// Grades a student can plan for. A+ counts the same as A, so it is left out to keep the list short.
const TARGET_GRADES = GRADES.filter((g) => g.grade !== "A+" && g.points >= 1);

// What each remaining course needs for the class the student is aiming at, with a grade they can change.
export default function PlannerPanel({ courses, data, actions }) {
  const plan = useMemo(
    () => buildPlan({ courses, grades: data.grades, track: data.track, targets: data.targets, goalLabel: data.goal }),
    [courses, data.grades, data.track, data.targets, data.goal],
  );
  const { goal, ladder, track, remaining } = plan;
  const onTrack = plan.projected != null && goal && plan.projected >= goal.min;
  const gap = goal && plan.projected != null ? Math.max(0, goal.min - plan.projected) : 0;

  const groups = useMemo(() => {
    const map = new Map();
    for (const c of remaining) {
      const key = `${c.year}-${c.semester}`;
      if (!map.has(key)) map.set(key, { year: c.year, semester: c.semester, courses: [] });
      map.get(key).courses.push(c);
    }
    return [...map.values()].sort((a, b) => a.year - b.year || a.semester - b.semester);
  }, [remaining]);

  if (data.track !== "bsc" && data.track !== "hons") return <ChooseDegreeFirst />;

  return (
    <section id="planner" aria-labelledby="planner-title" className="mt-14 scroll-mt-24 overflow-hidden rounded-[28px] border border-line bg-surface">
      {/* Header */}
      <div className="relative isolate flex flex-col gap-5 border-b border-line px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div className="pointer-events-none absolute -top-24 -left-16 -z-10 size-72 rounded-full bg-brand/10 blur-3xl" aria-hidden />
        <div>
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-brand uppercase">
            <Target className="size-3.5" aria-hidden /> Next-class planner
          </p>
          <h2 id="planner-title" className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
            {goal ? <>Your path to {goal.label}</> : "Plan your degree class"}
          </h2>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
            {plan.doneCredits
              ? `Based on ${plan.doneCredits} graded GPA credits and ${plan.remCredits} still to come in your ${track.long}.`
              : `No grades yet. Here's what each class needs across the ${plan.remCredits} GPA credits of your ${track.long}.`}
          </p>
        </div>
        <a
          href="#degree"
          className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-2xl border border-line bg-mist py-2 pr-3 pl-3.5 transition-colors hover:border-ink/30 sm:self-auto"
        >
          <GraduationCap className="size-5 text-brand" aria-hidden />
          <span>
            <span className="block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">Degree</span>
            <span className="block font-display text-[14px] leading-tight font-bold text-ink">{track.long}</span>
          </span>
          <span className="ml-1 text-[12.5px] font-semibold text-muted group-hover:text-ink">Change</span>
        </a>
      </div>

      {/* Class ladder: what each class needs. Pick one as the goal. */}
      <div role="radiogroup" aria-label="Class to aim for" className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {ladder.map((l) => {
          const selected = goal?.label === l.label;
          const here = plan.currentClass?.label === l.label;
          const disabled = l.status === "out" || l.status === "missed";
          return (
            <button
              key={l.label}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => actions.setGoal(l.label)}
              className={`relative flex flex-col items-start gap-1 p-5 text-left transition-colors sm:p-6 ${
                selected ? "bg-ink text-paper" : disabled ? "cursor-not-allowed bg-surface opacity-60" : "bg-surface hover:bg-mist"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`font-mono text-[11px] font-medium ${selected ? "text-paper/60" : "text-muted"}`}>from {l.min.toFixed(2)}</span>
                {here && (
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${selected ? "bg-paper/15 text-paper" : "bg-brand-soft text-brand"}`}>
                    You are here
                  </span>
                )}
              </span>
              <span className="mt-1 font-display text-[17px] font-bold tracking-tight">{SHORT[l.label] || l.label}</span>
              <Need l={l} plan={plan} selected={selected} />
            </button>
          );
        })}
      </div>

      {remaining.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-8 sm:px-7">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-good/15 text-good">
            <Check className="size-5" aria-hidden />
          </span>
          <p className="text-[14px] text-body">
            Every course in your {track.long} has a grade. Your GPA is <b className="text-ink">{formatGpa(plan.current)}</b>
            {plan.currentClass ? `, ${plan.currentClass.label}.` : "."}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
          {/* Projection */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className={`rounded-3xl p-5 ${onTrack ? "bg-ink text-paper" : "border border-brand/40 bg-brand-soft text-ink"}`}>
              <p className={`text-[11.5px] font-semibold tracking-[0.1em] uppercase ${onTrack ? "text-paper/55" : "text-brand"}`}>
                With these grades
              </p>
              <p className="mt-2 font-display text-5xl leading-none font-extrabold tracking-[-0.04em] tabular-nums">{formatGpa(plan.projected)}</p>
              <p className={`mt-1 text-[13px] ${onTrack ? "text-paper/65" : "text-body"}`}>
                Final GPA {plan.projectedClass ? `· ${plan.projectedClass.label}` : "· below Pass"}
              </p>
              <ProjectionBar projected={plan.projected} goal={goal} onTrack={onTrack} />
              <p className={`mt-4 flex items-start gap-2 text-[13px] leading-snug font-medium ${onTrack ? "text-paper/85" : "text-brand"}`}>
                {onTrack ? (
                  <>
                    <Flag className="mt-0.5 size-4 shrink-0" aria-hidden /> On track for {goal.label}.
                  </>
                ) : (
                  <>
                    <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden /> {gap.toFixed(2)} short of {goal?.label}. Raise a few grades, starting with
                    the courses with the most credits.
                  </>
                )}
              </p>
            </div>
            {plan.edited && (
              <button
                type="button"
                onClick={actions.resetTargets}
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Use the suggested grades
              </button>
            )}
            <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
              The suggestion keeps most courses at one grade and asks a step more of the courses with the most credits, because those move
              your GPA most. Change any grade to see what happens.
            </p>
          </div>

          {/* Remaining courses with target grades */}
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-bold text-ink">Grades to aim for</h3>
              <span className="text-[12.5px] text-muted">
                {remaining.length} courses · {plan.remCredits} credits
              </span>
            </div>
            <div className="mt-3 grid gap-4">
              {groups.map((g, gi) => (
                <details key={`${g.year}-${g.semester}`} open={gi < 2} className="group rounded-2xl border border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-[14.5px] font-bold text-ink">
                      Year {g.year} · Semester {ROMAN[g.semester]}
                    </span>
                    <span className="flex items-center gap-3 text-[12.5px] text-muted">
                      {summary(g.courses, plan.planned)}
                      <span className="text-brand transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </span>
                  </summary>
                  <ul className="divide-y divide-line border-t border-line">
                    {g.courses.map((c) => {
                      const planned = plan.planned[c.id];
                      const changed = planned !== plan.suggested[c.id];
                      return (
                        <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[5.5rem_1fr_3.5rem_auto]">
                          <span className="col-start-1 row-start-1 font-mono text-[12.5px] font-semibold text-brand">{displayCode(c.code)}</span>
                          <span className="col-span-2 col-start-1 row-start-2 min-w-0 truncate text-[13.5px] text-ink sm:col-span-1 sm:col-start-2 sm:row-start-1" title={c.title}>
                            {c.title}
                          </span>
                          <span className="hidden text-right text-[12.5px] text-muted tabular-nums sm:col-start-3 sm:row-start-1 sm:block">{c.credits} cr</span>
                          <span className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end sm:col-start-4">
                            {changed && (
                              <button
                                type="button"
                                onClick={() => actions.setTarget(c.id, null)}
                                title={`Back to the suggested ${plan.suggested[c.id]}`}
                                className="hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-muted hover:bg-mist hover:text-ink sm:inline-flex"
                              >
                                <X className="size-3" aria-hidden /> {plan.suggested[c.id]}
                              </button>
                            )}
                            <select
                              value={planned}
                              onChange={(e) => actions.setTarget(c.id, e.target.value)}
                              aria-label={`Target grade for ${displayCode(c.code)} ${c.title}`}
                              className={`grade-select h-9 w-[5.6rem] rounded-xl border border-dashed pr-7 pl-3 font-display text-[14px] font-bold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                                changed ? "border-ink bg-ink/[0.04] text-ink" : "border-line-strong bg-surface text-ink"
                              }`}
                            >
                              {TARGET_GRADES.map((t) => (
                                <option key={t.grade} value={t.grade}>
                                  {t.grade} · {t.points.toFixed(1)}
                                </option>
                              ))}
                            </select>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="flex items-start gap-2 border-t border-line bg-mist/60 px-5 py-4 text-[12.5px] leading-relaxed text-muted sm:px-7">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Plans use the GPA cut-offs only. Degree classes also need minimum grades and credits, and your final GPA counts your best{" "}
        {track.credits} credits ({track.label}), so treat this as a guide and check the Student Handbook.
      </p>
    </section>
  );
}

function Need({ l, plan, selected }) {
  const muted = selected ? "text-paper/65" : "text-muted";
  if (l.status === "secured")
    return (
      <>
        <span className={`text-[13.5px] font-semibold ${selected ? "text-paper" : "text-good"}`}>Secured</span>
        <span className={`text-[12.5px] ${muted}`}>{plan.remCredits ? "C or better in the rest keeps it" : "Your final GPA is above it"}</span>
      </>
    );
  if (l.status === "out" || l.status === "missed")
    return (
      <>
        <span className={`text-[13.5px] font-semibold ${selected ? "text-paper" : "text-ink"}`}>Out of reach</span>
        <span className={`text-[12.5px] ${muted}`}>{plan.remCredits ? `Highest possible is ${formatGpa(plan.best)}` : "No courses left to raise it"}</span>
      </>
    );
  return (
    <>
      <span className={`text-[13.5px] font-semibold ${selected ? "text-paper" : "text-ink"}`}>
        Average <span className="tabular-nums">{l.need.toFixed(2)}</span> needed
      </span>
      <span className={`text-[12.5px] ${muted}`}>About {l.words} in every remaining course</span>
    </>
  );
}

// A 0-4 track with the goal's cut-off marked, so the gap (or the margin) is visible.
function ProjectionBar({ projected, goal, onTrack }) {
  const pct = projected != null ? (projected / 4) * 100 : 0;
  const goalPct = goal ? (goal.min / 4) * 100 : null;
  return (
    <div className="relative mt-4 h-2 rounded-full bg-current/15" aria-hidden>
      <div className={`h-full rounded-full ${onTrack ? "bg-[#e5484d]" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      {goalPct != null && (
        <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-current" style={{ left: `calc(${goalPct}% - 1px)` }} title={`${goal.label} ${goal.min.toFixed(2)}`} />
      )}
    </div>
  );
}

// "B+ ×3 · A- ×2" for a semester's planned grades, highest first.
function summary(courses, planned) {
  const counts = new Map();
  for (const c of courses) counts.set(planned[c.id], (counts.get(planned[c.id]) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => GRADE_POINTS[b[0]] - GRADE_POINTS[a[0]])
    .map(([g, n]) => `${g} ×${n}`)
    .join(" · ");
}

// Until the degree is chosen the planner has nothing to plan over, so it sends the student back to step 2.
function ChooseDegreeFirst() {
  return (
    <section id="planner" aria-labelledby="planner-title" className="mt-14 scroll-mt-24 overflow-hidden rounded-[28px] border border-line bg-surface">
      <div className="relative isolate flex flex-col items-start gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="pointer-events-none absolute -top-24 -left-16 -z-10 size-72 rounded-full bg-brand/10 blur-3xl" aria-hidden />
        <div>
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-brand uppercase">
            <Target className="size-3.5" aria-hidden /> Next-class planner
          </p>
          <h2 id="planner-title" className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
            Choose BSc or BSc Honours to plan your class
          </h2>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
            The planner shows the GPA you need for each class and a grade to aim for in every remaining course. It needs to know whether
            your degree is three years or four.
          </p>
        </div>
        <a
          href="#degree"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-16px_rgb(229_72_77/0.8)] transition-colors hover:bg-brand-dark"
        >
          <ArrowUp className="size-4" aria-hidden /> Choose your degree
        </a>
      </div>
    </section>
  );
}
