"use client";

import { useState } from "react";
import { ArrowDown, Atom, Check, FileUp, FlaskConical, HeartPulse, Laptop, Leaf } from "lucide-react";
import { buildCourses, computeGpa, formatGpa } from "@/lib/gpa";
import { EMPTY_DEPT_DATA } from "@/lib/storage";
import RestoreButton from "./RestoreButton";

const ICONS = { bio: Leaf, chem: FlaskConical, it: Laptop, hp: HeartPulse, phy: Atom };

// The first thing a student does, so it sits in the hero as a framed panel with a step marker.
export default function DepartmentPicker({ departments, selected, onSelect, onRestore, data, ready }) {
  const waiting = ready && !selected;
  const [message, setMessage] = useState(null);

  return (
    <div id="departments" className="relative scroll-mt-24">
      {/* Red glow behind the panel draws the eye; it breathes until a department is chosen. */}
      <div
        className={`pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[40px] bg-brand/10 blur-2xl transition-opacity duration-700 ${
          waiting ? "animate-pulse opacity-100" : "opacity-50"
        }`}
        aria-hidden
      />

      <div className="relative rounded-[28px] border border-line bg-surface/70 p-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:p-2.5 dark:bg-[#0e0e10]/85 dark:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent" aria-hidden />

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-3 pt-3 pb-4 sm:px-4 sm:pt-4 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[15px] font-bold text-white shadow-[0_0_0_5px_rgb(229_72_77/0.15)]">
              1
            </span>
            <div>
              <h2 className="font-display text-lg leading-tight font-bold tracking-tight text-ink sm:text-xl">Choose your department</h2>
              <p className="mt-0.5 text-[13px] text-muted">Courses, credits and GPA weights load instantly.</p>
            </div>
          </div>

          {selected ? (
            <a
              href="#calculator"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white"
            >
              Enter your grades
              <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden />
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-[12.5px] font-semibold text-brand">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              Start here
            </span>
          )}
        </div>

        <div role="radiogroup" aria-label="Department" className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-5">
          {departments.map((d, i) => {
            const Icon = ICONS[d.id];
            const isOn = d.id === selected;
            const saved = ready && data[d.id] ? computeGpa(buildCourses(d, data[d.id] || EMPTY_DEPT_DATA), data[d.id].grades) : null;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={isOn}
                onClick={() => onSelect(d.id)}
                className={`group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5 ${
                  isOn
                    ? "border-ink bg-ink text-paper shadow-[0_24px_50px_-24px_rgb(229_72_77/0.55)]"
                    : "border-line bg-surface/80 text-ink hover:-translate-y-1 hover:border-brand/50 hover:bg-surface hover:shadow-[0_18px_40px_-24px_rgb(229_72_77/0.5)]"
                } ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex size-10 items-center justify-center rounded-xl transition-colors ${
                      isOn ? "bg-[#a00000] text-white" : "bg-ink/[0.05] text-ink group-hover:bg-brand group-hover:text-white dark:bg-white/[0.06]"
                    }`}
                  >
                    <Icon className="size-[19px]" aria-hidden />
                  </span>
                  {isOn ? (
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#a00000] text-white">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-muted transition-colors group-hover:text-brand">0{i + 1}</span>
                  )}
                </div>
                <div className="mt-6">
                  <span className="block font-display text-[15.5px] leading-tight font-bold tracking-tight">{d.name}</span>
                  <span className={`mt-1 block text-xs ${isOn ? "text-paper/60" : "text-muted"}`}>
                    {saved && saved.gpa != null
                      ? `Saved · GPA ${formatGpa(saved.gpa)}`
                      : `${d.subjects.length > 1 ? `${d.subjects.length} subjects` : d.subjects[0].label}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Restore lives here too, so a student whose browser data was cleared can get it back before choosing. */}
        <div className="flex flex-col gap-3 px-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p
            role="status"
            className={`text-[13px] ${message ? (message.tone === "error" ? "font-medium text-brand" : "font-medium text-good") : "text-muted"}`}
          >
            {message?.text ??
              (selected
                ? "Your grades are kept separately for each department."
                : "Cleared your browser? Upload a report you exported earlier to get every grade back.")}
          </p>
          <RestoreButton
            onRestore={onRestore}
            onMessage={setMessage}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-line-strong bg-surface px-4 text-[13px] font-semibold text-ink transition-colors hover:border-brand/60 hover:bg-brand/10 dark:bg-white/[0.04] disabled:opacity-60 sm:self-auto"
          >
            <FileUp className="size-4" aria-hidden /> Restore from PDF
          </RestoreButton>
        </div>
      </div>
    </div>
  );
}
