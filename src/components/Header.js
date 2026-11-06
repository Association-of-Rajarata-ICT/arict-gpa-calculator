"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { reducedMotion, ScrollTrigger } from "@/lib/motion";

// Page links and the sections inside them. A section link on another page goes through the page transition.
const NAV = [
  { id: "home", label: "Home", page: "/" },
  { id: "calculator", label: "Calculator", page: "/calculator" },
  { id: "planner", label: "Planner", page: "/calculator", hash: "planner" },
  { id: "report", label: "PDF report", page: "/", hash: "report" },
  { id: "grading", label: "Grading", page: "/", hash: "grading" },
  { id: "faq", label: "FAQ", page: "/", hash: "faq" },
];
// Sections watched by the scroll spy on each page, and which nav item each one lights up.
const SPY = {
  "/": { "class-planner": "planner", report: "report", grading: "grading", faq: "faq" },
  "/calculator": { planner: "planner" },
};

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Switches theme with a circular wipe from the toggle, where the browser supports view transitions.
function switchTheme(event) {
  const root = document.documentElement;
  const apply = () => {
    const dark = root.classList.toggle("dark");
    try {
      localStorage.setItem("arict-theme", dark ? "dark" : "light");
    } catch {}
  };
  if (!document.startViewTransition || reducedMotion()) return apply();

  const x = event?.clientX ?? window.innerWidth - 40;
  const y = event?.clientY ?? 40;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const t = document.startViewTransition(apply);
  t.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

export default function Header() {
  const pathname = usePathname();
  const [spy, setSpy] = useState({ path: null, id: null });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const progressRef = useRef(null);
  const [pill, setPill] = useState(null);

  // The bar stays in view at all times; it firms up and shows reading progress once the page scrolls.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
        setScrolled(y > 24);
      },
    });
    return () => st.kill();
  }, []);

  // Scroll spy: the section crossing the upper third of the screen is the current one.
  useEffect(() => {
    const map = SPY[pathname] ?? {};
    const ids = Object.keys(map);
    if (!ids.length) return;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        setSpy({ path: pathname, id: [...ids].reverse().find((id) => seen.get(id)) ?? null });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    // The page has just rendered, but give late-mounting sections a beat before observing them.
    const t = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 120);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);

  const section = spy.path === pathname ? spy.id : null;
  const active =
    pathname === "/"
      ? (SPY["/"][section] ?? "home")
      : pathname.startsWith("/calculator")
        ? (section ? SPY["/calculator"][section] : "calculator")
        : null;
  const hrefOf = (item) => (item.hash ? (pathname === item.page ? `#${item.hash}` : `${item.page}#${item.hash}`) : item.page);

  // The highlight slides under the active link.
  useIsoLayoutEffect(() => {
    const nav = navRef.current;
    const link = active && nav?.querySelector(`[data-id="${active}"]`);
    setPill(link ? { x: link.offsetLeft, w: link.offsetWidth } : null);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-[70] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      {/* Reading progress along the top edge. */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden>
        <div ref={progressRef} className="h-full origin-left scale-x-0 bg-brand" />
      </div>

      <header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
      >
        <div
          className={`relative mx-auto max-w-[64rem] rounded-[22px] border transition-[background-color,border-color,box-shadow,max-width] duration-500 ${
            scrolled || open
              ? "max-w-[60rem] border-line bg-surface/80 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.35)] backdrop-blur-xl backdrop-saturate-150"
              : "border-transparent bg-surface/40 backdrop-blur-md"
          }`}
        >
          <div className="flex h-14 items-center justify-between gap-3 pr-2 pl-4 sm:pl-5">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md py-1" aria-label="ARICT GPA Calculator, home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/arict-wordmark.png" alt="ARICT" className="h-[18px] w-auto select-none sm:h-5 dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="hidden h-[18px] w-auto select-none sm:h-5 dark:block" />
              <span className="inline-flex items-center rounded-md bg-brand px-1.5 py-0.5 font-display text-[11px] font-extrabold tracking-wide text-white">
                GPA
              </span>
            </Link>

            <nav ref={navRef} className="relative hidden items-center lg:flex" aria-label="Main">
              <span
                className="absolute inset-y-0 left-0 my-auto h-9 rounded-full bg-ink/[0.06] transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/[0.08]"
                style={{ width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)`, opacity: pill ? 1 : 0 }}
                aria-hidden
              />
              {NAV.map((item) => (
                <Link
                  key={item.id}
                  href={hrefOf(item)}
                  data-id={item.id}
                  aria-current={active === item.id ? "true" : undefined}
                  className={`relative rounded-full px-3 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                    active === item.id ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="https://papers.arict.lk"
                target="_blank"
                rel="noopener"
                className="relative inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] font-medium whitespace-nowrap text-muted transition-colors hover:text-ink"
              >
                Past Papers <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />
              </a>
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={switchTheme}
                className="group relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-ink/80 transition-colors hover:bg-ink/[0.06] hover:text-ink dark:hover:bg-white/10"
                aria-label="Toggle dark mode"
              >
                <Moon className="size-[18px] transition-transform duration-500 group-hover:-rotate-12 dark:translate-y-8 dark:rotate-90" aria-hidden />
                <Sun className="absolute size-[18px] -translate-y-8 -rotate-90 transition-transform duration-500 group-hover:rotate-45 dark:translate-y-0 dark:rotate-0" aria-hidden />
              </button>
              <a
                href="https://arict.lk"
                data-magnetic
                className="group hidden h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white xl:inline-flex"
              >
                arict.lk
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-paper lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="size-[18px]" aria-hidden /> : <Menu className="size-[18px]" aria-hidden />}
              </button>
            </div>
          </div>

          {/* Mobile menu folds open inside the same floating card. */}
          <div
            id="mobile-nav"
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
              open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
            }`}
            inert={!open}
          >
            <nav className="overflow-hidden" aria-label="Mobile">
              <ul className="grid gap-0.5 border-t border-line px-2 pt-2 pb-3">
                {[...NAV.map((n) => ({ ...n, href: hrefOf(n) })), { href: "https://papers.arict.lk", id: "papers", label: "Past Papers", external: true }, { href: "https://arict.lk", id: "arict", label: "arict.lk", external: true }].map(
                  (item, i) => (
                    <li key={item.id} style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }} className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
                      {(() => {
                        const Tag = item.external ? "a" : Link;
                        return (
                          <Tag
                            href={item.href}
                            onClick={() => setOpen(false)}
                            {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
                            className={`flex items-center justify-between rounded-2xl px-3 py-3 font-display text-[17px] font-bold tracking-tight transition-colors hover:bg-mist ${
                              active === item.id ? "text-brand" : "text-ink"
                            }`}
                          >
                            {item.label}
                            {item.external ? (
                              <ArrowUpRight className="size-4 text-muted" aria-hidden />
                            ) : (
                              <span className="font-mono text-[11px] font-medium text-muted">0{i + 1}</span>
                            )}
                          </Tag>
                        );
                      })()}
                    </li>
                  ),
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
