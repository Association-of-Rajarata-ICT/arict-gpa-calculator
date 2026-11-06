"use client";

import { useState } from "react";
import { ArrowLeftRight, ChevronDown, CircleHelp, EyeOff, ListChecks, Plus } from "lucide-react";

const ITEMS = [
  {
    icon: ListChecks,
    name: "Grade",
    text: "Pick the grade you got. Leave it blank for a course you haven't sat yet.",
  },
  {
    icon: ArrowLeftRight,
    name: "Move to the other semester",
    text: "Use it if your timetable puts the course in the other semester. The GPA of both semesters updates.",
  },
  {
    icon: EyeOff,
    name: "Remove from your list",
    text: "For a course you're not taking. It stops counting toward your GPA. Bring it back from “Show removed courses” at the bottom of the semester.",
  },
  {
    icon: Plus,
    name: "Add course",
    text: "Adds a course that isn't listed. Enter its code, name, credits and whether it counts toward the GPA.",
  },
];

// Spells out what the small icon buttons on every course row do. Open by default until the first grade is
// entered, so a new student reads it first; after that it tucks away to one line, and can be reopened.
export default function CourseGuide({ hasGrades }) {
  const [manual, setManual] = useState(null);
  const open = manual ?? !hasGrades;

  return (
    <section aria-labelledby="guide-title" className="mt-6 overflow-hidden rounded-[22px] border border-line bg-surface">
      <button
        type="button"
        onClick={() => setManual(!open)}
        aria-expanded={open}
        aria-controls="guide-body"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CircleHelp className="size-4" aria-hidden />
          </span>
          <span>
            <span id="guide-title" className="block font-display text-[15px] leading-tight font-bold text-ink">
              What do the buttons on each course do?
            </span>
            {!open && <span className="block text-[12.5px] text-muted">Grade, move to the other semester, remove, add</span>}
          </span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      <div id="guide-body" className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <ul className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
            {ITEMS.map((it) => (
              <li key={it.name} className="flex items-start gap-3 bg-surface p-4 sm:p-5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-mist text-ink">
                  <it.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-[14px] font-bold text-ink">{it.name}</h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{it.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
