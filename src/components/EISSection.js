"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Lock, RefreshCw, User, Zap } from "lucide-react";
import { buildImportState } from "@/lib/eis";
import { scrollToId } from "@/lib/motion";
import { loadProfile } from "@/lib/storage";
import EISLoginDialog from "./EISLoginDialog";

/**
 * Dedicated EIS Auto-Fill Section
 * Positioned before the Department Picker as the primary, recommended 1-click option.
 * Remembers the connected EIS profile in localStorage so students don't need to re-login every time.
 */
export default function EISSection({ onRestore, selectedDept, data }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eisProfile, setEisProfile] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load remembered EIS profile from localStorage on mount
  useEffect(() => {
    const p = loadProfile();
    if (p && p.regNo && p.isEis) {
      setEisProfile(p);
    }
  }, []);

  const hasConnected = Boolean(eisProfile?.regNo);

  function handleEISImport(eisData) {
    try {
      const importData = buildImportState(eisData);
      onRestore({ ...importData, source: "eis" });
      setEisProfile({
        name: eisData.student?.name || "",
        regNo: eisData.student?.regNo || "",
        isEis: true,
      });
      setStatusMessage(null); // clear any old error; the card is the success indicator
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to process EIS data. Please try again.",
      });
    }
  }

  function handleDialogClose(res) {
    setDialogOpen(false);
    if (res?.success) {
      // Scroll to calculator only after modal has closed and body scroll is restored
      setTimeout(() => scrollToId("calculator"), 120);
    }
  }

  return (
    <section id="eis-section" aria-label="Auto-import from EIS" className="relative scroll-mt-24">
      {/* Ambient red breathing glow behind the primary card */}
      <div
        className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-[36px] bg-brand/15 blur-2xl transition-opacity duration-700 dark:bg-brand/20"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[26px] border border-brand/40 bg-gradient-to-b from-brand/[0.08] via-surface/85 to-surface p-5 shadow-[0_24px_60px_-25px_rgb(229_72_77/0.3)] backdrop-blur-xl sm:p-7 dark:from-brand/[0.14] dark:via-[#111114]/95 dark:to-[#0e0e10]/95 dark:border-brand/45 dark:shadow-[0_28px_70px_-25px_rgb(229_72_77/0.4)]">
        {/* Top gradient line */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left content */}
          <div className="max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full border border-brand/50 bg-brand/20 px-3 py-1 text-[12px] font-bold tracking-wide text-brand uppercase dark:bg-brand/30 dark:text-red-300">
                Recommended · Fastest Way
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted">
                <Lock className="size-3 text-good" />
                No password stored
              </span>
            </div>

            <h2 className="mt-3 font-display text-xl leading-snug font-bold tracking-tight text-ink sm:text-2xl">
              Auto-Fill All Your Results from EiS
            </h2>

            <p className="mt-2 text-[14px] leading-relaxed text-body sm:text-[14.5px]">
              Don&apos;t waste time choosing subjects and typing 30+ course grades manually. Log in with your Rajarata University
              EIS credentials to automatically select your department, load every enrolled semester, hide subjects you didn&apos;t take, and calculate your exact GPA in seconds.
            </p>

            {/* Feature badges */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted">
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Zap className="size-3.5 text-brand" /> Auto-detects department & track
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 className="size-3.5 text-good" /> Only your enrolled courses
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <CheckCircle2 className="size-3.5 text-good" /> Includes Pre-semester & repeat grades
              </span>
            </div>

            {/* Error message (success is shown via the connected card below) */}
            {statusMessage && statusMessage.type === "error" && (
              <div className="mt-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-[13px] font-medium text-brand">
                {statusMessage.text}
              </div>
            )}

            {/* Connected card — shown whenever EIS is connected and stored in this browser */}
            {eisProfile && eisProfile.regNo && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-good/30 bg-good/10 px-4 py-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-good text-white">
                  <User className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{eisProfile.name || "Student"}</p>
                  <p className="font-mono text-[12px] text-muted">{eisProfile.regNo}</p>
                </div>
                <span className="ml-auto shrink-0 text-[12px] font-semibold text-good">
                  EiS Connected ✓
                </span>
              </div>
            )}
          </div>

          {/* Right Action Card */}
          <div className="shrink-0 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="group relative inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 font-display text-[15px] font-bold text-white shadow-[0_12px_28px_-8px_rgb(229_72_77/0.5)] transition-all duration-200 hover:scale-[1.02] hover:bg-brand-dark hover:shadow-[0_16px_36px_-8px_rgb(229_72_77/0.65)] active:scale-[0.98]"
            >
              {hasConnected ? (
                <>
                  <RefreshCw className="size-4.5 transition-transform group-hover:rotate-180 duration-500" />
                  Re-sync from EIS
                </>
              ) : (
                <>
                  Import from EIS
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <EISLoginDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onImport={handleEISImport}
      />
    </section>
  );
}
