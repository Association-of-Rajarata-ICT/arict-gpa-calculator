"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTop, ScrollTrigger } from "@/lib/motion";

const R = 20;
const C = 2 * Math.PI * R;

// Appears once the page has been scrolled a little. A ring around the arrow fills as you read down the page,
// and a click glides back to the top.
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const shouldShow = self.scroll() > 600;
        setShow((prev) => (prev !== shouldShow ? shouldShow : prev));
        ring.current?.setAttribute("stroke-dashoffset", String(C * (1 - self.progress)));
      },
    });
    return () => st.kill();
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      className={`group fixed right-4 bottom-20 z-[55] inline-flex size-12 items-center justify-center rounded-full border border-line bg-surface/85 text-ink shadow-[0_14px_34px_-14px_rgb(0_0_0/0.5)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-6 lg:bottom-6 ${
        show ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-90 opacity-0"
      }`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
        <circle
          ref={ring}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <ArrowUp className="relative size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
    </button>
  );
}
