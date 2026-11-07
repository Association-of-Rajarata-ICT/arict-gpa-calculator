"use client";

import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS } from "@/data/departments";
import { buildCourses, classFor, computeGpa, computeTerms, countedCourses, formatGpa, getDepartment, latestGradedYear, trackYears, YEARS } from "@/lib/gpa";
import { EMPTY_DEPT_DATA, EMPTY_STATE, loadState, saveProfile, saveState } from "@/lib/storage";
import DepartmentPicker from "./DepartmentPicker";
import SemesterCard from "./SemesterCard";
import SummaryPanel from "./SummaryPanel";
import PlannerPanel from "./PlannerPanel";
import DegreeStep from "./DegreeStep";
import CourseGuide from "./CourseGuide";
import HeroStage from "./HeroStage";
import { scrollToId } from "@/lib/motion";

export default function Calculator({ intro }) {
  const [state, setState] = useState(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [year, setYear] = useState(1);

  // localStorage only exists in the browser, so the saved state loads after hydration.
  useEffect(() => {
    const saved = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const dept = getDepartment(state.dept);
  const data = (dept && state.data[dept.id]) || EMPTY_DEPT_DATA;

  const courses = useMemo(() => (dept ? buildCourses(dept, data) : []), [dept, data]);
  const hidden = useMemo(() => new Set(data.hidden), [data.hidden]);
  const active = useMemo(() => courses.filter((c) => !hidden.has(c.id)), [courses, hidden]);

  // A BSc counts Years 1-3; Honours (or no choice yet) counts all four. Year 4 stays editable either way.
  const track = data.track;
  const counted = useMemo(() => countedCourses(active, track), [active, track]);
  const terms = useMemo(() => computeTerms(counted, data.grades, trackYears(track)), [counted, data.grades, track]);
  const allTerms = useMemo(() => computeTerms(active, data.grades), [active, data.grades]);

  const overall = useMemo(() => computeGpa(counted, data.grades), [counted, data.grades]);

  function selectDept(id) {
    setState((s) => ({ ...s, dept: id }));
    // Open the latest year with grades, so returning students land where they left off.
    setYear(latestGradedYear(state.data[id]));
  }

  function update(fn) {
    if (!dept) return;
    setState((s) => ({ ...s, data: { ...s.data, [dept.id]: fn(s.data[dept.id] || EMPTY_DEPT_DATA) } }));
  }

  const actions = {
    setGrade(id, grade) {
      update((d) => {
        const grades = { ...d.grades };
        if (grade) grades[id] = grade;
        else delete grades[id];
        return { ...d, grades };
      });
    },
    clearGrades(ids) {
      update((d) => {
        const grades = { ...d.grades };
        for (const id of ids) delete grades[id];
        return { ...d, grades };
      });
    },
    move(course) {
      const target = course.semester === 1 ? 2 : 1;
      update((d) => ({ ...d, moved: { ...d.moved, [course.id]: target } }));
    },
    hide(id) {
      update((d) => ({ ...d, hidden: [...new Set([...d.hidden, id])] }));
    },
    unhide(id) {
      update((d) => ({ ...d, hidden: d.hidden.filter((h) => h !== id) }));
    },
    addCustom(course) {
      update((d) => ({ ...d, custom: [...d.custom, course] }));
    },
    removeCustom(id) {
      update((d) => {
        const grades = { ...d.grades };
        delete grades[id];
        return { ...d, custom: d.custom.filter((c) => c.id !== id), grades };
      });
    },
    toggleSubject(prefix) {
      update((d) => {
        const current = d.subjects ?? dept.subjects.map((s) => s.prefix);
        const next = current.includes(prefix) ? current.filter((p) => p !== prefix) : [...current, prefix];
        return { ...d, subjects: next };
      });
    },
    // Next-class planner.
    setTrack(track) {
      update((d) => ({ ...d, track }));
    },
    setGoal(goal) {
      update((d) => ({ ...d, goal }));
    },
    setTarget(id, grade) {
      update((d) => {
        const targets = { ...(d.targets || {}) };
        if (grade) targets[id] = grade;
        else delete targets[id];
        return { ...d, targets };
      });
    },
    resetTargets() {
      update((d) => ({ ...d, targets: {} }));
    },
    resetDept() {
      setState((s) => {
        const data = { ...s.data };
        delete data[dept.id];
        return { ...s, data };
      });
    },
    // A restored report or backup replaces the departments it contains and keeps any others.
    importState({ state: next, profile }) {
      setState((s) => ({ version: 1, dept: next.dept || s.dept, data: { ...s.data, ...next.data } }));
      const target = next.dept || state.dept;
      setYear(latestGradedYear(next.data[target] || state.data[target]));
      if (profile && (profile.name || profile.regNo)) saveProfile(profile);
      setTimeout(() => scrollToId("calculator"), 80);
    },
  };

  const enabledSubjects = data.subjects ?? dept?.subjects.map((s) => s.prefix) ?? [];
  const yearTerms = allTerms.filter((t) => t.year === year);
  const notCounted = year > trackYears(track);
  const existingCodes = new Map(courses.map((c) => [c.code, c]));

  return (
    <>
      <HeroStage anchorId="departments">
        {intro}
        <div data-hero="5" className="mt-24 sm:mt-32">
          <DepartmentPicker
            departments={DEPARTMENTS}
            selected={state.dept}
            onSelect={selectDept}
            onRestore={actions.importState}
            data={state.data}
            ready={ready}
          />
        </div>
      </HeroStage>

      <section id="calculator" className="container-page scroll-mt-24 pt-4 pb-24">
        {!ready ? (
          <div className="mt-10 h-96 animate-pulse rounded-3xl bg-mist" aria-hidden />
        ) : !dept ? (
          <EmptyState />
        ) : (
          <>
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-muted">{dept.programme}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
                      {dept.name}
                    </h2>
                  </div>
                  <YearTabs year={year} onChange={setYear} terms={allTerms} track={track} />
                </div>

                {dept.subjects.length > 1 && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-[13px] font-medium text-muted">Your subjects</span>
                    {dept.subjects.map((s) => {
                      const on = enabledSubjects.includes(s.prefix);
                      return (
                        <button
                          key={s.prefix}
                          type="button"
                          onClick={() => actions.toggleSubject(s.prefix)}
                          aria-pressed={on}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
                            on
                              ? "border-ink bg-ink text-paper"
                              : "border-line-strong bg-surface text-muted hover:border-ink/40 hover:text-ink"
                          }`}
                        >
                          <span className="font-mono text-[11px] opacity-70">{s.prefix}</span>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <DegreeStep track={track} onChange={actions.setTrack} />

                <CourseGuide hasGrades={Object.keys(data.grades).length > 0} />

                {notCounted && (
                  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-line-strong bg-mist px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13.5px] text-body">
                      <b className="text-ink">Year 4 is for BSc Honours.</b> You can still enter these grades, but they are not counted in your BSc
                      GPA.
                    </p>
                    <button
                      type="button"
                      onClick={() => actions.setTrack("hons")}
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface px-4 text-[13px] font-semibold text-ink hover:border-ink/40"
                    >
                      Switch to BSc Honours
                    </button>
                  </div>
                )}

                <div key={`${dept.id}-${year}`} className={`rise-children mt-6 grid gap-6 ${notCounted ? "opacity-60" : ""}`}>
                  {yearTerms.map((t) => (
                    <SemesterCard
                      key={`${dept.id}-${t.year}-${t.semester}`}
                      term={t}
                      courses={courses.filter((c) => c.year === t.year && c.semester === t.semester)}
                      hidden={hidden}
                      grades={data.grades}
                      actions={actions}
                      existingCodes={existingCodes}
                    />
                  ))}
                </div>

                {year < trackYears(track) && (
                  <button
                    type="button"
                    onClick={() => {
                      setYear(year + 1);
                      scrollToId("calculator");
                    }}
                    className="mt-6 mx-auto flex items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 text-[14px] font-semibold text-ink shadow-sm transition-all hover:border-ink/40 hover:bg-mist hover:shadow-md active:scale-[0.98]"
                  >
                    Continue to Year {year + 1}
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                )}
              </div>

              {/* On phones the summary sits below every semester, so keep the overall GPA in view. */}
              <a
                href="#summary"
                className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full bg-[#0b0b0b] py-2 pr-2 pl-5 text-white dark:bg-surface shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] ring-1 ring-white/10 lg:hidden"
              >
                <span className="text-[12px] font-semibold tracking-[0.08em] text-white/60 uppercase">Overall GPA</span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-xl font-extrabold tabular-nums">{formatGpa(overall.gpa)}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#0b0b0b]">
                    {classFor(overall.gpa)?.label.replace("Second Class", "2nd") ?? "Summary"}
                  </span>
                </span>
              </a>

              <SummaryPanel
                dept={dept}
                overall={overall}
                terms={terms}
                onJump={(y) => {
                  setYear(y);
                  scrollToId("calculator");
                }}
                state={state}
                actions={actions}
              />
            </div>
            <PlannerPanel courses={active} data={data} actions={actions} />
          </>
        )}
      </section>
    </>
  );
}

function YearTabs({ year, onChange, terms, track }) {
  return (
    <div role="tablist" aria-label="Academic year" className="inline-flex self-start rounded-full border border-line bg-mist p-1 sm:self-auto">
      {YEARS.map((y) => {
        const graded = terms.some((t) => t.year === y && t.graded > 0);
        const selected = y === year;
        const honsOnly = y > trackYears(track);
        return (
          <button
            key={y}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(y)}
            title={honsOnly ? "BSc Honours only: not counted in a BSc GPA" : undefined}
            className={`relative inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold transition-all ${
              selected ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-muted hover:text-ink"
            } ${honsOnly ? "opacity-55" : ""}`}
          >
            Year {y}
            {honsOnly && <span className="rounded-full bg-ink/[0.07] px-1.5 py-px text-[10px] font-bold tracking-wide text-muted uppercase dark:bg-white/10">Hons</span>}
            {graded && <span className={`size-1.5 rounded-full ${selected ? "bg-brand" : "bg-muted/60"}`} aria-label="has grades" />}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState() {
  const steps = [
    { n: "01", title: "Pick your department", text: "Courses, credits and GPA weights load from the faculty curriculum." },
    { n: "02", title: "Enter your grades", text: "Choose a grade for each course you sat. Leave the rest blank." },
    { n: "03", title: "See every GPA", text: "Semester, cumulative and overall GPA update as you go, with your class band." },
  ];
  return (
    <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
      {steps.map((s) => (
        <div key={s.n} className="bg-surface p-6 sm:p-7">
          <span className="font-mono text-xs font-medium text-brand">{s.n}</span>
          <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink">{s.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
