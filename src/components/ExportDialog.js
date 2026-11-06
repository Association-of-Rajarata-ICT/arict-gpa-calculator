"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, LoaderCircle, X } from "lucide-react";
import { loadProfile, saveProfile } from "@/lib/storage";
import { formatRegNo, parseRegNo, prefixesFor, regNoError } from "@/lib/regno";

// Asks for an optional name and registration number before the PDF is built.
// Mounted only while open, so it reads the remembered details fresh each time.
export default function ExportDialog({ deptId, deptName, onExport, onClose }) {
  const ref = useRef(null);
  const numberRef = useRef(null);
  const prefixes = prefixesFor(deptId);
  const [initial] = useState(loadProfile);
  // A remembered number fills the fields when its prefix fits this department.
  const [saved] = useState(() => {
    const p = parseRegNo(initial.regNo);
    return p && prefixes.includes(p.prefix) ? p : null;
  });
  const [name, setName] = useState(initial.name);
  const [prefix, setPrefix] = useState(saved?.prefix ?? prefixes[0]);
  const [year, setYear] = useState(saved?.year ?? "");
  const [number, setNumber] = useState(saved?.number ?? "");
  const [regError, setRegError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const regFilled = Boolean(year || number);
  const regNo = regFilled && !regNoError({ year, number }) ? formatRegNo({ prefix, year, number }) : "";

  // Pasting a whole number, like ICT/2022/074, into either box splits it across the fields.
  function pasteWhole(e) {
    const p = parseRegNo(e.clipboardData.getData("text"));
    if (!p) return;
    e.preventDefault();
    if (prefixes.includes(p.prefix)) setPrefix(p.prefix);
    setYear(p.year);
    setNumber(p.number);
    setRegError(null);
  }

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function run(withDetails) {
    if (withDetails) {
      const problem = regNoError({ year, number });
      setRegError(problem);
      if (problem) return;
    }
    setBusy(withDetails ? "details" : "skip");
    setError(null);
    try {
      const details = withDetails ? { name: name.trim(), regNo } : {};
      if (withDetails) saveProfile(details);
      await onExport(details);
      onClose();
    } catch (e) {
      console.error(e);
      setError("The report couldn't be created. Please try again.");
      setBusy(null);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && !busy && ref.current.close()}
      aria-labelledby="export-title"
      className="m-auto w-[min(92vw,27rem)] overflow-hidden rounded-3xl border border-line bg-surface p-0 text-body shadow-[0_40px_90px_-30px_rgb(0_0_0/0.6)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          run(true);
        }}
      >
        <div className="relative isolate overflow-hidden bg-[#0b0b0b] px-6 pt-6 pb-5 text-white">
          <div className="pointer-events-none absolute -top-20 -right-16 -z-10 size-56 rounded-full bg-[#a00000]/50 blur-3xl" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="h-4 w-auto" />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              disabled={Boolean(busy)}
              className="-mt-1 -mr-1 inline-flex size-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <h2 id="export-title" className="mt-5 font-display text-xl font-bold tracking-tight">
            Download your GPA report
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-white/60">
            {deptName}. Add your name or registration number to print them on the report, or skip it.
          </p>
        </div>

        <div className="grid gap-4 px-6 pt-5 pb-2">
          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-ink">
              Name <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              autoFocus
              placeholder="e.g. K. M. Perera"
              className="h-11 rounded-xl border border-line-strong bg-paper px-3.5 text-[14px] text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-3 focus:ring-brand/15"
            />
          </label>
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-[13px] font-semibold text-ink">
              Registration number <span className="font-normal text-muted">(optional)</span>
            </legend>
            <div
              className={`flex h-11 items-center rounded-xl border bg-paper font-mono text-[14px] text-ink transition-shadow focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 ${
                regError ? "border-brand" : "border-line-strong"
              }`}
            >
              {prefixes.length > 1 ? (
                <div className="flex h-full items-center gap-0.5 pl-1.5" role="radiogroup" aria-label="Stream">
                  {prefixes.map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={prefix === p}
                      onClick={() => setPrefix(p)}
                      className={`h-8 rounded-lg px-2 font-semibold transition-colors ${
                        prefix === p ? "bg-ink text-paper" : "text-muted hover:text-ink"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="pl-3.5 font-semibold" aria-label={`Prefix ${prefix}`}>
                  {prefix}
                </span>
              )}
              <span className="px-1.5 text-muted" aria-hidden>
                /
              </span>
              <input
                value={year}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setYear(v);
                  setRegError(null);
                  if (v.length === 4) numberRef.current?.focus();
                }}
                onPaste={pasteWhole}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Intake year"
                placeholder="2022"
                className="w-[3.4rem] bg-transparent text-center outline-none placeholder:text-muted/50"
              />
              <span className="px-1.5 text-muted" aria-hidden>
                /
              </span>
              <input
                ref={numberRef}
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value.replace(/\D/g, "").slice(0, 3));
                  setRegError(null);
                }}
                onBlur={() => number && setNumber(number.padStart(3, "0"))}
                onKeyDown={(e) => e.key === "Backspace" && !number && e.currentTarget.previousElementSibling?.previousElementSibling?.focus()}
                onPaste={pasteWhole}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Number"
                placeholder="074"
                className="w-[2.8rem] bg-transparent text-center outline-none placeholder:text-muted/50"
              />
            </div>
            {regError ? (
              <p role="alert" className="text-[12px] font-medium text-brand">
                {regError}
              </p>
            ) : (
              <p className="text-[12px] text-muted">
                {prefixes.length > 1 ? `Choose your stream, then your intake year and number. ` : ""}
                Prints as <span className="font-mono font-semibold text-ink">{regNo || formatRegNo({ prefix, year: year || "2022", number: number || "074" })}</span>
              </p>
            )}
          </fieldset>
          <p className="text-[12px] leading-relaxed text-muted">
            Use English letters for your name so it prints correctly. Both stay on this device and are filled in next time.
          </p>
          {error && (
            <p role="alert" className="text-[13px] font-medium text-brand">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 pt-3 pb-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => run(false)}
            disabled={Boolean(busy)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[13.5px] font-semibold text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-60"
          >
            {busy === "skip" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Skip and download
          </button>
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgb(160_0_0/0.8)] transition-colors hover:bg-brand-dark disabled:opacity-70"
          >
            {busy === "details" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <FileDown className="size-4" aria-hidden />}
            Download report
          </button>
        </div>
      </form>
    </dialog>
  );
}
