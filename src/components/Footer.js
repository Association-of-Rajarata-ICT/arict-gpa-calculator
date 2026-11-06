import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// The site footer. The home page adds the closing call to action; the calculator page keeps it slim.
export default function Footer({ cta = false }) {
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-paper">
      <div className="pointer-events-none absolute bottom-[-18rem] left-1/2 -z-10 h-[26rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" aria-hidden />

      {cta && (
        <div className="container-page py-20 text-center sm:py-28">
          <p data-reveal className="font-mono text-xs font-medium tracking-wide text-brand uppercase">Ready when you are</p>
          <h2 data-reveal className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold tracking-[-0.04em] text-balance text-ink sm:text-6xl">
            Check your GPA in <span className="font-serif font-normal tracking-[-0.02em] text-brand italic">under a minute.</span>
          </h2>
          <div data-reveal className="mt-9 flex justify-center">
            <Link
              href="/calculator"
              data-magnetic
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink pr-2 pl-6 text-[14.5px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white"
            >
              Start calculating
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper/15 transition-transform group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      )}

      <div className="container-page">
        <div className="flex flex-col gap-4 border-t border-line py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark.png" alt="ARICT" className="h-4 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="hidden h-4 w-auto dark:block" />
            <span>Association of Rajarata Information &amp; Communication Technology</span>
          </div>
          <nav className="flex gap-5" aria-label="ARICT">
            <Link href="/calculator" className="transition-colors hover:text-ink">Calculator</Link>
            <Link href="/#faq" className="transition-colors hover:text-ink">FAQ</Link>
            <a href="https://arict.lk" className="transition-colors hover:text-ink">arict.lk</a>
            <a href="https://papers.arict.lk" className="transition-colors hover:text-ink">Past Papers</a>
            <a href="https://arict.lk/contact" className="transition-colors hover:text-ink">Contact</a>
          </nav>
        </div>
      </div>

      {/* Oversized wordmark, cut off by the page edge. */}
      <p
        className="pointer-events-none -mb-[0.2em] bg-gradient-to-b from-ink/[0.07] to-transparent bg-clip-text text-center font-display text-[19vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-transparent select-none"
        aria-hidden
      >
        ARICT
      </p>
    </footer>
  );
}
