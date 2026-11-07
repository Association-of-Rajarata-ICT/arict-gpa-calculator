"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, reducedMotion, ScrollTrigger, SCROLL_OFFSET, setLenis } from "@/lib/motion";

// Lenis drives the page scroll and GSAP's ticker drives Lenis, so scroll-linked animations
// and the smooth scroll share one frame loop. Off entirely for people who ask for less motion.
export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      anchors: { offset: SCROLL_OFFSET, duration: 1.2 },
      // Native dialogs and anything marked data-lenis-prevent or role="dialog" keep their own scrolling.
      prevent: (node) =>
        node.nodeName === "DIALOG" ||
        Boolean(node.closest?.("[data-lenis-prevent], [role='dialog'], .lenis-prevent")),
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    // The calculator grows and shrinks as departments and years change. Keep trigger positions true
    // and resize Lenis immediately so the scroll limit matches the new content height.
    let timer;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 100);
    });
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
