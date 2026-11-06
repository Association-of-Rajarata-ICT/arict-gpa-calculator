"use client";

import { useState } from "react";
import { Braces, FileDown, HardDrive, RotateCcw, Upload } from "lucide-react";
import { classFor, formatGpa, nextClass, ROMAN } from "@/lib/gpa";
import { createReport, downloadBytes } from "@/lib/report";
import ExportDialog from "./ExportDialog";
import RestoreButton from "./RestoreButton";
import AnimatedNumber from "./motion/AnimatedNumber";

export default function SummaryPanel({ dept, overall, terms, onJump, state, actions }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState(null);
  const [exporting, setExporting] = useState(false);

  const band = classFor(overall.gpa);
  const next = nextClass(overall.gpa);
  const pct = overall.gpa != null ? (overall.gpa / 4) * 100 : 0;

  async function exportPdf(details) {
    const { bytes, filename } = await createReport(state, details);
    downloadBytes(bytes, filename);
    setMessage({ tone: "ok", text: "Report downloaded. Keep it safe: it restores your grades." });
  }

  function exportJson() {
    const json = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    downloadBytes(json, `arict-gpa-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    setMessage({ tone: "ok", text: "JSON backup downloaded." });
  }

  return (
    <aside id="summary" className="scroll-mt-24 lg:sticky lg:top-24" aria-label="GPA summary">
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0b0b] p-6 text-white dark:bg-surface shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] ring-1 ring-white/10">
        <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-[#a00000]/45 blur-3xl" aria-hidden />
        <div className="relative">
          <p className="text-[12px] font-semibold tracking-[0.1em] text-white/55 uppercase">Overall GPA</p>
          <p className="mt-2 font-display text-7xl leading-none font-extrabold tracking-[-0.04em] tabular-nums" aria-live="polite">
            <AnimatedNumber value={overall.gpa} format={formatGpa} />
          </p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div className="h-full rounded-full bg-[#e5484d] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${pct}%` }} />
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
        <h3 className="text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">Report &amp; backup</h3>
        <button
          type="button"
          onClick={() => setExporting(true)}
          className="group mt-3 flex w-full items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-left text-paper transition-colors hover:bg-ink-soft"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <FileDown className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold">Download PDF report</span>
            <span className="block text-[12px] text-paper/60">Every GPA, course and grade</span>
          </span>
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <RestoreButton
            onRestore={actions.importState}
            onMessage={setMessage}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line-strong text-[13px] font-semibold text-ink hover:border-ink disabled:opacity-60"
          >
            <Upload className="size-4" aria-hidden /> Restore
          </RestoreButton>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line-strong text-[13px] font-semibold text-ink hover:border-ink"
          >
            <Braces className="size-4" aria-hidden /> JSON
          </button>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
          <HardDrive className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
          Saved only in this browser. The PDF report is also a backup: restore it here on any device.
        </p>
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
      {exporting && <ExportDialog deptId={dept.id} deptName={dept.name} onExport={exportPdf} onClose={() => setExporting(false)} />}
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#0b0b0b] px-4 py-3 dark:bg-surface">
      <dt className="text-[11.5px] text-white/50">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
