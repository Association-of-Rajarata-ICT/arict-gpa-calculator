"use client";

import { useGSAP } from "@gsap/react";
import { gsap, reducedMotion, ScrollTrigger } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

// Page-wide motion, wired by data attributes so server components can opt in without becoming client code:
//   data-hero="n"        intro timeline on load, in order of n
//   data-reveal          fades up as it scrolls into view
//   data-reveal-stagger  its children fade up one after another
//   data-parallax="0.1"  drifts against the scroll by that fraction of its height
//   data-magnetic        leans toward the pointer on hover
// The `motion` class on <html> (set before paint) hides reveal targets so nothing flashes before GSAP runs.
export default function PageMotion() {
  useGSAP(() => {
    const root = document.documentElement;
    if (reducedMotion()) {
      root.classList.remove("motion");
      return;
    }

    // Intro: the hero builds itself line by line.
    const hero = gsap.utils.toArray("[data-hero]").sort((a, b) => Number(a.dataset.hero) - Number(b.dataset.hero));
    const intro = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.1 }, delay: 0.1 });
    hero.forEach((el, i) => {
      const words = el.querySelectorAll(".split-inner");
      const at = i === 0 ? 0 : "-=0.85";
      if (words.length) {
        intro.set(el, { autoAlpha: 1 }, at);
        intro.fromTo(words, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.06 }, "<");
      } else {
        intro.fromTo(el, { autoAlpha: 0, y: 26, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", clearProps: "filter" }, at);
      }
    });

    // Single elements.
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.fromTo(els, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true }),
    });

    // Groups: cards, list items, table rows.
    gsap.utils.toArray("[data-reveal-stagger]").forEach((group) => {
      gsap.fromTo(
        group.children,
        { autoAlpha: 0, y: 30, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        },
      );
    });

    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const amount = Number(el.dataset.parallax) || 0.1;
      gsap.fromTo(
        el,
        { yPercent: amount * 100 },
        { yPercent: -amount * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });

    // Magnetic hover, only where there is a real pointer.
    const cleanups = [];
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      gsap.utils.toArray("[data-magnetic]").forEach((el) => {
        const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * 0.25);
          y((e.clientY - (r.top + r.height / 2)) * 0.35);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  });

  return null;
}
