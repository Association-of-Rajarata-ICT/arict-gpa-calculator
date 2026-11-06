"use client";

import { Check, GraduationCap } from "lucide-react";
import { TRACKS } from "@/lib/planner";

// Step 2, right after the department: BSc (3 years) or BSc Honours (4 years). It decides which
// years count toward the GPA and what the planner plans for, so it asks loudly until it is answered.
export default function DegreeStep({ track, onChange }) {
  const chosen = track === "bsc" || track === "hons";

  return (
    <div
      id="degree"
      className={`relative mt-6 scroll-mt-28 overflow-hidden rounded-[22px] border p-4 transition-colors sm:p-5 ${
        chosen ? "border-line bg-surface" : "border-brand/50 bg-brand/[0.06] shadow-[0_20px_50px_-30px_rgb(229_72_77/0.6)]"
      }`}
    >
      {!chosen && <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent" aria-hidden />}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-bold text-white ${
              chosen ? "bg-good" : "bg-brand shadow-[0_0_0_5px_rgb(229_72_77/0.15)]"
            }`}
          >
            {chosen ? <Check className="size-4" strokeWidth={3} aria-hidden /> : "2"}
          </span>
          <div>
            {!chosen && (
              <p className="mb-0.5 inline-flex items-center gap-2 text-[12px] font-bold tracking-wide text-brand uppercase">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
                Choose this first
              </p>
            )}
            <h3 id="degree-title" className="font-display text-[17px] leading-tight font-bold tracking-tight text-ink">
              {chosen ? `Degree: ${TRACKS[track].long}` : "Are you doing a BSc or a BSc Honours?"}
            </h3>
            <p className="mt-0.5 text-[13px] text-muted">
              {chosen
                ? track === "bsc"
                  ? "Years 1 to 3 count toward your GPA. Year 4 is marked Honours only."
                  : "Years 1 to 4 count toward your GPA."
                : "It decides which years count toward your GPA and what the planner aims for."}
            </p>
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="degree-title" className="grid grid-cols-2 gap-2 lg:w-[22rem] lg:shrink-0">
          {Object.values(TRACKS).map((t) => {
            const on = track === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(t.id)}
                className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all ${
                  on
                    ? "border-ink bg-ink text-paper"
                    : chosen
                      ? "border-line-strong bg-surface text-ink hover:border-ink/40"
                      : "border-brand/40 bg-surface text-ink hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_14px_30px_-18px_rgb(229_72_77/0.7)]"
                }`}
              >
                <GraduationCap className={`size-5 shrink-0 ${on ? "text-paper" : "text-brand"}`} aria-hidden />
                <span className="min-w-0">
                  <span className="block font-display text-[14.5px] leading-tight font-bold">{t.label}</span>
                  <span className={`block text-[12px] ${on ? "text-paper/65" : "text-muted"}`}>
                    {t.years} years · {t.credits} credits
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
