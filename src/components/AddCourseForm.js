"use client";

import { useId, useState } from "react";
import { creditsFor, displayCode, findCourse, isNonGpaCode, normalizeCode, parseCode, ROMAN } from "@/lib/gpa";

export default function AddCourseForm({ year, semester, existingCodes, onAdd, onCancel }) {
  const uid = useId();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [nonGpa, setNonGpa] = useState(false);
  const [touched, setTouched] = useState({ title: false, credits: false });
  const [error, setError] = useState("");

  function onCodeChange(value) {
    setCode(value);
    setError("");
    const norm = normalizeCode(value);
    const known = findCourse(norm);
    if (known && !touched.title) setTitle(known.title);
    if (parseCode(norm) && !touched.credits) setCredits(String(creditsFor(norm)));
    setNonGpa(isNonGpaCode(norm));
  }

  function submit(e) {
    e.preventDefault();
    const norm = normalizeCode(code);
    if (!norm) return setError("Enter a course code, like ICT 1407.");
    const existing = existingCodes.get(norm);
    if (existing) {
      return setError(
        `${displayCode(norm)} is already listed under Year ${existing.year}, Semester ${ROMAN[existing.semester]}. Use the move button there, or restore it if you removed it.`,
      );
    }
    if (!title.trim()) return setError("Enter the course title.");
    const cr = Number(credits);
    if (!Number.isFinite(cr) || cr < 0 || cr > 12) return setError("Credits must be a number from 0 to 12.");
    onAdd({
      id: `custom-${norm}-${Date.now().toString(36)}`,
      code: norm,
      title: title.trim(),
      credits: cr,
      nonGpa: nonGpa || cr === 0,
      year,
      semester,
    });
  }

  const field =
    "h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-ink focus-visible:ring-2 focus-visible:ring-brand/30";

  return (
    <form onSubmit={submit} className="border-t border-line bg-brand-soft/40 px-5 py-4 sm:px-6" noValidate>
      <p className="text-[13px] font-semibold text-ink">Add a course to this semester</p>
      <p className="mt-0.5 text-xs text-muted">Credits fill in from the code (the second digit). Change them if your course differs.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr_6rem]">
        <div>
          <label htmlFor={`${uid}-code`} className="mb-1 block text-xs font-medium text-muted">Code</label>
          <input
            id={`${uid}-code`}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="ICT 1407"
            autoComplete="off"
            autoFocus
            className={`${field} font-mono uppercase`}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-title`} className="mb-1 block text-xs font-medium text-muted">Title</label>
          <input
            id={`${uid}-title`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTouched((t) => ({ ...t, title: true }));
            }}
            placeholder="Course title"
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-credits`} className="mb-1 block text-xs font-medium text-muted">Credits</label>
          <input
            id={`${uid}-credits`}
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            value={credits}
            onChange={(e) => {
              setCredits(e.target.value);
              setTouched((t) => ({ ...t, credits: true }));
            }}
            className={`${field} tabular-nums`}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-body">
          <input type="checkbox" checked={nonGpa} onChange={(e) => setNonGpa(e.target.checked)} className="size-4 accent-[var(--brand)]" />
          Non-GPA course (not counted)
        </label>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink">
            Cancel
          </button>
          <button type="submit" className="h-9 rounded-full bg-ink px-5 text-[13px] font-semibold text-paper hover:bg-ink-soft">
            Add course
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] font-medium text-brand">
          {error}
        </p>
      )}
    </form>
  );
}
