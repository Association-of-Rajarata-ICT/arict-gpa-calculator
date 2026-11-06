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

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Header height plus breathing room, so a scrolled-to section never sits under the floating header.
export const SCROLL_OFFSET = -88;

// One way to scroll to a section, whether or not Lenis is running.
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: SCROLL_OFFSET, duration: 1.2 });
  else el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}
