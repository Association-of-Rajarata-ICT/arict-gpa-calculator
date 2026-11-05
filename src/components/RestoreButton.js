"use client";

import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { BackupError, readBackupFile } from "@/lib/report";

// Opens a file picker for a report PDF (or an older JSON backup) and hands the data back.
export default function RestoreButton({ onRestore, onMessage, className, children }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handle(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const result = await readBackupFile(file);
      onRestore(result);
      const when = result.exportedAt
        ? ` from ${new Date(result.exportedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
        : "";
      onMessage?.({ tone: "ok", text: `Grades restored${when}.` });
    } catch (err) {
      onMessage?.({
        tone: "error",
        text: err instanceof BackupError ? err.message : "That file isn't an ARICT GPA report or backup.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className={className}>
        {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf,application/json,.json"
        onChange={handle}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />
    </>
  );
}
