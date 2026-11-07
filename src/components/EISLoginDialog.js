"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, EyeOff, Loader2, LogIn, ShieldCheck, X } from "lucide-react";
import { getLenis } from "@/lib/motion";

/**
 * EIS Login Dialog — lets students log in with their Rajarata University EIS
 * credentials, fetches their results from the profile page, and returns
 * structured data that the calculator can import.
 *
 * Props:
 *  - open      boolean   whether the dialog is visible
 *  - onClose   (result?: { success?: boolean })=>void  close the dialog
 *  - onImport  (data)=>void  called with the EIS response when import succeeds
 */
export default function EISLoginDialog({ open, onClose, onImport }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null); // { totalCourses, gradedCourses }
  const inputRef = useRef(null);

  // Focus the student ID field when the dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("idle");
      setError("");
      setStats(null);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Prevent body scroll and pause Lenis smoothly when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    } else {
      document.body.style.overflow = "";
      getLenis()?.start();
      getLenis()?.resize();
    }
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
      getLenis()?.resize();
    };
  }, [open]);

  function handleClose() {
    const wasSuccess = phase === "success";
    onClose({ success: wasSuccess });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) return;

    setPhase("loading");
    setError("");

    try {
      const res = await fetch("/api/eis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });

      const data = await res.json();

      if (!data.success) {
        setPhase("error");
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      setPhase("success");
      // Count stats
      const total = data.semesters.reduce((n, s) => n + s.courses.length, 0);
      const graded = data.semesters.reduce((n, s) => n + s.courses.filter((c) => c.grade).length, 0);
      setStats({ totalCourses: total, gradedCourses: graded });

      // Call the import callback to load data
      onImport(data);
    } catch {
      setPhase("error");
      setError("Could not connect to the server. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Import from EIS"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={phase === "loading" ? undefined : handleClose}
        aria-hidden
      />

      {/* Centering wrapper that allows full scroll on mobile/small viewports */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        {/* Dialog card with max-height and internal scroll */}
        <div
          data-lenis-prevent
          className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col animate-[dialog-in_0.2s_ease-out] rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden dark:bg-[#141416] dark:border-white/10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={phase === "loading"}
            className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <div className="overflow-y-auto p-5 sm:p-7 overscroll-contain">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Download className="size-5" />
              </span>
              <div className="min-w-0 pr-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-ink">
                  Import from EIS
                </h2>
                <p className="text-[13px] text-muted truncate sm:whitespace-normal">
                  Rajarata University — Examination Information System
                </p>
              </div>
            </div>

            {phase === "success" ? (
              /* ─── Success State ─── */
              <div className="mt-6">
                <div className="flex items-start gap-3 rounded-xl border border-good/30 bg-good/10 p-4">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-good text-white">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">Grades imported successfully</p>
                    <p className="mt-1 text-[13px] text-body">
                      Imported <strong>{stats?.totalCourses ?? 0}</strong> courses
                      {stats?.gradedCourses > 0 && <> (<strong>{stats.gradedCourses}</strong> with grades)</>}.
                      {stats?.totalCourses > stats?.gradedCourses && (
                        <> Courses without results are shown but left ungraded.</>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-[14px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white"
                >
                  Done — view your GPA
                </button>
              </div>
            ) : (
              /* ─── Form State ─── */
              <form onSubmit={handleSubmit} className="mt-5">
                <p className="text-[13.5px] text-body leading-relaxed">
                  Log in with your EIS credentials to auto-fill all your enrolled courses and grades.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="eis-sid" className="mb-1.5 block text-[12.5px] font-semibold text-muted uppercase tracking-wide">
                      Student ID
                    </label>
                    <input
                      ref={inputRef}
                      id="eis-sid"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. ICT/2022/074"
                      disabled={phase === "loading"}
                      autoComplete="username"
                      className="w-full rounded-xl border border-line-strong bg-mist px-4 py-2.5 text-[14px] text-ink placeholder:text-muted/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60 dark:bg-white/[0.04]"
                    />
                  </div>
                  <div>
                    <label htmlFor="eis-pw" className="mb-1.5 block text-[12.5px] font-semibold text-muted uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="eis-pw"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your EIS password"
                        disabled={phase === "loading"}
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-line-strong bg-mist px-4 py-2.5 pr-11 text-[14px] text-ink placeholder:text-muted/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60 dark:bg-white/[0.04]"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:text-ink"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {phase === "error" && (
                  <div className="mt-3 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-[13px] font-medium text-brand">
                    {error}
                  </div>
                )}

                {/* Security note */}
                <div className="mt-4 flex items-start gap-2 text-[12.5px] text-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-good" />
                  <span>
                    Your credentials are sent directly to EIS and are <strong className="text-ink">never stored</strong> by this site.
                  </span>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={phase === "loading"}
                    className="flex-1 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:bg-mist disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={phase === "loading" || !studentId.trim() || !password.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper transition-all hover:bg-brand hover:text-white disabled:opacity-60"
                  >
                    {phase === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <LogIn className="size-4" />
                        Import Grades
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
