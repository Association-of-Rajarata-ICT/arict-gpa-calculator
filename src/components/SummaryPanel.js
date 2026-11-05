"use client";

import { useRef, useState } from "react";
import { Download, HardDrive, RotateCcw, Upload } from "lucide-react";
import { classFor, formatGpa, nextClass, ROMAN } from "@/lib/gpa";
import { sanitize } from "@/lib/storage";

export default function SummaryPanel({ dept, overall, terms, onJump, state, actions }) {
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState(null);

  const band = classFor(overall.gpa);
  const next = nextClass(overall.gpa);
  const pct = overall.gpa != null ? (overall.gpa / 4) * 100 : 0;

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arict-gpa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: "ok", text: "Backup downloaded." });
  }

  async function importBackup(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const next = sanitize(JSON.parse(await file.text()));
      actions.importState({ ...next, dept: next.dept || dept.id });
      setMessage({ tone: "ok", text: "Backup restored." });
    } catch {
      setMessage({ tone: "error", text: "That file isn't an ARICT GPA backup." });
    }
  }

  return (
    <aside id="summary" className="scroll-mt-24 lg:sticky lg:top-24" aria-label="GPA summary">
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0b0b] p-6 text-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] ring-1 ring-white/10">
        <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-[#a00000]/45 blur-3xl" aria-hidden />
        <div className="relative">
          <p className="text-[12px] font-semibold tracking-[0.1em] text-white/55 uppercase">Overall GPA</p>
          <p className="mt-2 font-display text-7xl leading-none font-extrabold tracking-[-0.04em] tabular-nums" aria-live="polite">
            {formatGpa(overall.gpa)}
          </p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div className="h-full rounded-full bg-[#e5484d] transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {band ? (
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-[12.5px] font-bold text-[#0b0b0b]">{band.label}</span>
            ) : (
              <span className="text-[13px] text-white/55">Enter a grade to see your GPA.</span>
            )}
            {next && <span className="text-[12.5px] text-white/60">{next.gap.toFixed(2)} to {next.label}</span>}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
            <Stat label="GPA credits" value={overall.credits} />
            <Stat label="Courses graded" value={overall.graded} />
          </dl>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-surface p-5">
        <h3 className="text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">By semester</h3>
        <ol className="mt-3 grid gap-1">
          {terms.map((t) => (
            <li key={`${t.year}-${t.semester}`}>
              <button
                type="button"
                onClick={() => onJump(t.year)}
                className="grid w-full grid-cols-[5.5rem_1fr_2.75rem] items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-mist"
              >
                <span className="text-[13px] font-medium text-body">
                  Y{t.year} · S{ROMAN[t.semester]}
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-mist" aria-hidden>
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${t.gpa != null ? (t.gpa / 4) * 100 : 0}%` }} />
                </span>
                <span className={`text-right font-display text-sm font-bold tabular-nums ${t.gpa != null ? "text-ink" : "text-muted/50"}`}>
                  {formatGpa(t.gpa)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-surface p-5">
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
          <HardDrive className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
          Saved only in this browser. Download a backup to move your grades to another device.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={exportBackup} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-ink text-[13px] font-semibold text-paper hover:bg-ink-soft">
            <Download className="size-4" aria-hidden /> Backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line-strong text-[13px] font-semibold text-ink hover:border-ink"
          >
            <Upload className="size-4" aria-hidden /> Restore
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importBackup} className="hidden" />
        </div>
        {confirmReset ? (
          <div className="mt-3 rounded-2xl bg-brand-soft p-3">
            <p className="text-[13px] font-medium text-ink">Clear every grade and change for {dept.name}?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  actions.resetDept();
                  setConfirmReset(false);
                  setMessage({ tone: "ok", text: `${dept.name} reset.` });
                }}
                className="h-8 rounded-full bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-dark"
              >
                Yes, reset
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="h-8 rounded-full px-3 text-[13px] font-semibold text-muted hover:text-ink">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-brand"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Reset {dept.name}
          </button>
        )}
        {message && (
          <p role="status" className={`mt-3 text-[13px] font-medium ${message.tone === "error" ? "text-brand" : "text-good"}`}>
            {message.text}
          </p>
        )}
      </div>
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#0b0b0b] px-4 py-3">
      <dt className="text-[11.5px] text-white/50">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
