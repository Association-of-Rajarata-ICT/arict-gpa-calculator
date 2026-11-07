"use client";

import { useState } from "react";
import { ArrowLeftRight, Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import { displayCode, formatGpa, GRADES, ROMAN } from "@/lib/gpa";
import AddCourseForm from "./AddCourseForm";

export default function SemesterCard({ term, courses, hidden, grades, eisGrades = {}, actions, existingCodes }) {
  const [showHidden, setShowHidden] = useState(false);
  const [adding, setAdding] = useState(false);

  const shown = courses.filter((c) => !hidden.has(c.id));
  const hiddenCourses = courses.filter((c) => hidden.has(c.id));
  const gradedIds = shown.filter((c) => grades[c.id]).map((c) => c.id);
  const totalCredits = shown.reduce((n, c) => n + (c.nonGpa ? 0 : c.credits), 0);
  const titleId = `term-${term.year}-${term.semester}`;

  const modifiedEisIds = shown
    .filter((c) => eisGrades[c.id] && grades[c.id] !== eisGrades[c.id])
    .map((c) => c.id);

  return (
    <article aria-labelledby={titleId} className="overflow-hidden rounded-3xl border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-wide text-brand uppercase">
            Year {term.year} · Semester {ROMAN[term.semester]}
          </p>
          <h3 id={titleId} className="mt-0.5 font-display text-lg font-bold tracking-tight text-ink">
            Semester {ROMAN[term.semester]}
          </h3>
        </div>
        <dl className="flex items-center gap-5 text-right">
          <div>
            <dt className="text-[11px] font-medium text-muted">Credits</dt>
            <dd className="font-display text-base font-bold text-ink tabular-nums">
              {term.credits}
              <span className="text-muted">/{totalCredits}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-muted">Cumulative</dt>
            <dd className="font-display text-base font-bold text-ink tabular-nums">{formatGpa(term.cumulative)}</dd>
          </div>
          <div className="rounded-2xl bg-mist px-3.5 py-1.5">
            <dt className="text-[11px] font-medium text-muted">Semester GPA</dt>
            <dd className={`font-display text-2xl leading-tight font-extrabold tabular-nums ${term.gpa != null ? "text-ink" : "text-muted/60"}`}>
              {formatGpa(term.gpa)}
            </dd>
          </div>
        </dl>
      </header>

      {shown.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted">No courses in this semester. Add one below if you took it.</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((c) => (
            <CourseRow
              key={c.id}
              course={c}
              grade={grades[c.id] || ""}
              eisGrade={eisGrades[c.id] || null}
              actions={actions}
            />
          ))}
        </ul>
      )}

      {adding && (
        <AddCourseForm
          year={term.year}
          semester={term.semester}
          existingCodes={existingCodes}
          onAdd={(course) => {
            actions.addCustom(course);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-mist/60 px-5 py-3 sm:px-6">
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:text-brand"
          >
            <Plus className="size-4" aria-hidden /> Add course
          </button>
        )}
        {modifiedEisIds.length > 0 && (
          <button
            type="button"
            onClick={() => actions.resetEisGrades(modifiedEisIds)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-dark"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Reset {modifiedEisIds.length === 1 ? "grade" : `${modifiedEisIds.length} grades`} to EIS
          </button>
        )}
        {gradedIds.length > 0 && (
          <button
            type="button"
            onClick={() => actions.clearGrades(gradedIds)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Clear grades
          </button>
        )}
        {hiddenCourses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            aria-expanded={showHidden}
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
          >
            <Eye className="size-3.5" aria-hidden />
            {showHidden ? "Hide" : "Show"} {hiddenCourses.length} removed {hiddenCourses.length === 1 ? "course" : "courses"}
          </button>
        )}
      </footer>

      {showHidden && hiddenCourses.length > 0 && (
        <ul className="divide-y divide-line border-t border-line bg-mist/60">
          {hiddenCourses.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-5 py-2.5 sm:px-6">
              <span className="font-mono text-xs font-semibold text-muted">{displayCode(c.code)}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">{c.title}</span>
              <button
                type="button"
                onClick={() => actions.unhide(c.id)}
                className="text-[13px] font-semibold text-ink hover:text-brand"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CourseRow({ course: c, grade, eisGrade, actions }) {
  const label = `${displayCode(c.code)} ${c.title}`;
  const other = c.semester === 1 ? "II" : "I";
  const isEisModified = Boolean(eisGrade && grade !== eisGrade);

  return (
    <li className={`group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-5 py-3 transition-colors sm:grid-cols-[6.5rem_1fr_auto_auto] sm:px-6 ${grade ? "" : "hover:bg-mist/50"}`}>
      <span className="col-start-1 row-start-1 font-mono text-[13px] font-semibold text-brand">{displayCode(c.code)}</span>

      <div className="col-start-1 row-start-2 min-w-0 sm:col-start-2 sm:row-start-1">
        <p className={`text-[14.5px] leading-snug font-medium ${grade ? "text-ink" : "text-body"}`}>{c.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Tag>{c.credits} {c.credits === 1 ? "credit" : "credits"}</Tag>
          {c.nonGpa ? <Tag tone="warn">Non-GPA</Tag> : <Tag tone="good">GPA</Tag>}
          {c.custom && <Tag>Added by you</Tag>}
          {c.estimated && !c.custom && (
            <span className="text-[11px] text-muted" title="The handbook lists this course for the year but not the semester. Move it if yours differs.">
              Semester not confirmed
            </span>
          )}
        </div>
      </div>

      <div className="col-start-2 row-start-2 flex items-center justify-end gap-0.5 self-start sm:col-start-3 sm:row-start-1 sm:self-center sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <IconButton label={`Move ${label} to Semester ${other}`} onClick={() => actions.move(c)}>
          <ArrowLeftRight className="size-3.5" />
        </IconButton>
        {c.custom ? (
          <IconButton label={`Delete ${label}`} onClick={() => actions.removeCustom(c.id)}>
            <Trash2 className="size-3.5" />
          </IconButton>
        ) : (
          <IconButton label={`Remove ${label} (not taking it)`} onClick={() => actions.hide(c.id)}>
            <EyeOff className="size-3.5" />
          </IconButton>
        )}
      </div>

      <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 sm:col-start-4">
        {isEisModified && (
          <button
            type="button"
            onClick={() => actions.setGrade(c.id, eisGrade)}
            title={`Reset to auto-fetched EIS grade (${eisGrade})`}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand/20 transition-colors"
          >
            <RotateCcw className="size-3" aria-hidden /> Auto ({eisGrade})
          </button>
        )}
        <select
          value={grade}
          onChange={(e) => actions.setGrade(c.id, e.target.value)}
          aria-label={`Grade for ${label}`}
          className={`grade-select h-10 w-28 rounded-xl border pr-8 pl-3.5 font-display text-[15px] font-bold tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            isEisModified
              ? "border-brand bg-brand/[0.04] text-brand"
              : grade
                ? "border-ink bg-ink text-paper"
                : "border-line-strong bg-surface text-muted hover:border-ink/40"
          }`}
        >
          <option value="">Grade</option>
          {GRADES.map((g) => (
            <option key={g.grade} value={g.grade}>
              {g.grade}  ·  {g.points.toFixed(1)}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}

function Tag({ children, tone }) {
  const tones = {
    good: "bg-good/10 text-good",
    warn: "bg-brand-soft text-brand",
  };
  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${tones[tone] || "bg-mist text-muted"}`}>
      {children}
    </span>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink"
    >
      {children}
    </button>
  );
}
