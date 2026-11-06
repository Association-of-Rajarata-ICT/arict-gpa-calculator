"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, jumpTo, reducedMotion, ScrollTrigger, transition } from "@/lib/motion";

const LABELS = { "/": "Home", "/calculator": "GPA Calculator" };

// A two-layer curtain between pages: red leads, ink follows, and the page's name and the ARICT mark settle
// in the middle while the next page loads underneath. Every internal link goes through it, so no component
// needs to know about it. Skipped for reduced motion, new tabs, modified clicks, same-page hashes and
// external links, which all behave as normal.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef(null);
  const run = useRef({ busy: false, hash: "", timer: null, reveal: null });

  useEffect(() => {
    const el = root.current;
    const q = (s) => el.querySelector(s);
    const s = run.current;

    gsap.set(el, { autoAlpha: 0 });
    gsap.set([q("[data-red]"), q("[data-ink]")], { yPercent: 100 });

    function reveal() {
      clearTimeout(s.timer);
      jumpTo(s.hash); // under the curtain, so the new page is already in place when it lifts
      gsap
        .timeline({
          delay: 0.2,
          onComplete: () => {
            gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
            gsap.set([q("[data-red]"), q("[data-ink]")], { yPercent: 100 });
            s.busy = false;
            transition.active = false;
            ScrollTrigger.refresh();
          },
        })
        .to(q("[data-content]"), { autoAlpha: 0, y: -18, duration: 0.35, ease: "power2.in" })
        .to(q("[data-ink]"), { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "<0.1")
        .to(q("[data-red]"), { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "<0.12");
    }
    s.reveal = reveal;

    function go(url) {
      if (s.busy) return;
      s.busy = true;
      transition.active = true;
      s.hash = url.hash;
      q("[data-label]").textContent = LABELS[url.pathname] ?? "";

      gsap.set(el, { autoAlpha: 1, pointerEvents: "auto" }); // blocks clicks until the next page is ready
      gsap
        .timeline({
          onComplete: () => {
            router.push(url.pathname + url.search, { scroll: false });
            // If the next page never arrives, lift the curtain anyway rather than trap the visitor.
            s.timer = setTimeout(reveal, 5000);
          },
        })
        .fromTo(q("[data-red]"), { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power4.inOut" })
        .fromTo(q("[data-ink]"), { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power4.inOut" }, "<0.1")
        .fromTo(q("[data-content]"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .fromTo(q("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "<");
    }

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (reducedMotion()) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const clean = (p) => p.replace(/\/+$/, "") || "/";
      if (clean(url.pathname) === clean(window.location.pathname)) return;
      e.preventDefault();
      go(new URL(clean(url.pathname) + url.search + url.hash, url.origin));
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(s.timer);
    };
  }, [router]);

  // The new page has rendered: lift the curtain.
  useEffect(() => {
    const s = run.current;
    if (s.busy) s.reveal?.();
  }, [pathname]);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[100] invisible overflow-hidden" aria-hidden>
      <div data-red className="absolute inset-0 bg-brand" />
      <div data-ink className="absolute inset-0 bg-[#0a0a0b]">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(60%_50%_at_50%_100%,rgb(229_72_77/0.28),transparent_70%)]" />
        <div data-content className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arict-wordmark-light.png" alt="" className="h-7 w-auto select-none" />
          <p data-label className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-6xl" />
          <div className="h-0.5 w-40 overflow-hidden rounded-full bg-white/15">
            <div data-bar className="h-full origin-left bg-[#e5484d]" />
          </div>
        </div>
      </div>
    </div>
  );
}
