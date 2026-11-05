"use client";

import Link from "next/link";
import { ArrowUpRight, Moon, Sun } from "lucide-react";

const NAV = [
  { href: "#departments", label: "Calculator" },
  { href: "#grading", label: "Grading" },
  { href: "https://papers.arict.lk", label: "Past Papers", external: true },
];

export default function Header() {
  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("arict-theme", dark ? "dark" : "light");
    } catch {}
  }

  return (
    <>
      <a
        href="#departments"
        className="fixed top-2 left-2 z-[70] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform focus:translate-y-0"
      >
        Skip to calculator
      </a>
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-brand" aria-hidden />
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
        <div className="mx-auto flex max-w-[52rem] items-center justify-between gap-2 rounded-full border border-black/5 bg-surface/75 py-1.5 pr-1.5 pl-4 shadow-[0_6px_24px_-14px_rgb(0_0_0/0.25)] backdrop-blur-md sm:pl-5 dark:border-white/10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md py-1" aria-label="ARICT GPA Calculator, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark.png" alt="ARICT" className="h-[18px] w-auto select-none sm:h-5 dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="hidden h-[18px] w-auto select-none sm:h-5 dark:block" />
            <span className="h-4 w-px bg-line-strong" aria-hidden />
            <span className="font-display text-[13.5px] font-bold tracking-tight text-ink">GPA</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-ink/65 transition-colors hover:text-ink"
              >
                {item.label}
                {item.external && <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-9 items-center justify-center rounded-full text-ink/75 transition-colors hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
              aria-label="Toggle dark mode"
            >
              <Moon className="size-[18px] dark:hidden" aria-hidden />
              <Sun className="hidden size-[18px] dark:block" aria-hidden />
            </button>
            <a
              href="https://arict.lk"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              arict.lk
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
