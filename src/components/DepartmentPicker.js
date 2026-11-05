"use client";

import { Atom, Check, FlaskConical, HeartPulse, Laptop, Leaf } from "lucide-react";
import { buildCourses, computeGpa, formatGpa } from "@/lib/gpa";
import { EMPTY_DEPT_DATA } from "@/lib/storage";

const ICONS = { bio: Leaf, chem: FlaskConical, it: Laptop, hp: HeartPulse, phy: Atom };

export default function DepartmentPicker({ departments, selected, onSelect, data, ready }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">Choose your department</h2>
        {selected && <span className="hidden text-[13px] text-muted sm:inline">Your grades are kept separately for each department.</span>}
      </div>
      <div role="radiogroup" aria-label="Department" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
              className={`group relative flex min-h-32 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                isOn
                  ? "border-ink bg-ink text-paper shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)]"
                  : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_14px_30px_-22px_rgb(0_0_0/0.35)]"
              } ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl transition-colors ${
                    isOn ? "bg-brand text-white" : "bg-mist text-ink group-hover:bg-brand-soft group-hover:text-brand"
                  }`}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                {isOn ? (
                  <Check className="size-4 text-brand" aria-hidden />
                ) : (
                  <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
                )}
              </div>
              <div className="mt-5">
                <span className="block font-display text-[15px] leading-tight font-bold tracking-tight">{d.name}</span>
                <span className={`mt-1 block text-xs ${isOn ? "text-paper/60" : "text-muted"}`}>
                  {saved && saved.gpa != null ? `Saved · GPA ${formatGpa(saved.gpa)}` : `${d.subjects.length > 1 ? `${d.subjects.length} subjects` : d.subjects[0].label}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
