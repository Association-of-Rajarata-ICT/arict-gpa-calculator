"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, LoaderCircle, X } from "lucide-react";
import { loadProfile, saveProfile } from "@/lib/storage";

// Asks for an optional name and registration number before the PDF is built.
// Mounted only while open, so it reads the remembered details fresh each time.
export default function ExportDialog({ deptName, onExport, onClose }) {
  const ref = useRef(null);
  const [initial] = useState(loadProfile);
  const [name, setName] = useState(initial.name);
  const [regNo, setRegNo] = useState(initial.regNo);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function run(withDetails) {
    setBusy(withDetails ? "details" : "skip");
    setError(null);
    try {
      const details = withDetails ? { name: name.trim(), regNo: regNo.trim() } : {};
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
          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-ink">
              Registration number <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              maxLength={30}
              autoComplete="off"
              placeholder="e.g. 2021/ICT/045"
              className="h-11 rounded-xl border border-line-strong bg-paper px-3.5 font-mono text-[14px] text-ink outline-none placeholder:font-sans placeholder:text-muted/70 focus:border-brand focus:ring-3 focus:ring-brand/15"
            />
          </label>
          <p className="text-[12px] leading-relaxed text-muted">
            Use English letters so they print correctly. They stay on this device and are filled in next time.
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
