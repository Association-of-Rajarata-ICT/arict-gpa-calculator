"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Set by SmoothScroll while Lenis runs; null when smooth scrolling is off (reduced motion).
let lenis = null;
export function setLenis(instance) {
  lenis = instance;
}
export function getLenis() {
  return lenis;
}

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Every scroll target carries its own `scroll-mt-*` (clearing the floating header), and Lenis honours it, so
// no extra offset is added here.
export const SCROLL_OFFSET = 0;

// One way to scroll to a section, whether or not Lenis is running.
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  lenis?.resize();
  if (lenis) lenis.scrollTo(el, { offset: SCROLL_OFFSET, duration: 1.2 });
  else el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

// True from the moment a page transition starts until its curtain has lifted. PageMotion reads it so the
// new page's intro waits for the curtain instead of playing behind it.
export const transition = { active: false };

// Jumps (no animation) to the top, or to a #hash target, used while the transition curtain hides the page.
export function jumpTo(hash) {
  const el = hash ? document.getElementById(hash.replace(/^#/, "")) : null;
  // Lenis still remembers the previous page's height, which would clamp the jump, so measure again first.
  lenis?.resize();
  if (lenis) lenis.scrollTo(el || 0, { offset: el ? SCROLL_OFFSET : 0, immediate: true, force: true });
  else if (el) el.scrollIntoView({ behavior: "auto" });
  else window.scrollTo(0, 0);
}

// Smooth scroll back to the top, with or without Lenis.
export function scrollToTop() {
  lenis?.resize();
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}
