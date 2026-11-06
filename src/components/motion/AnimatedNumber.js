"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/lib/motion";

// Rolls a number from its last value to the new one. Keeps the text in the DOM, so screen readers
// and aria-live regions still read the final value.
export default function AnimatedNumber({ value, format, className, ...rest }) {
  const ref = useRef(null);
  const last = useRef(value);

  useEffect(() => {
    const el = ref.current;
    const from = last.current;
    last.current = value;
    if (!el || value == null || from == null || from === value || reducedMotion()) {
      if (el) el.textContent = format(value);
      return;
    }
    const obj = { v: from };
    const tween = gsap.to(obj, {
      v: value,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => (el.textContent = format(obj.v)),
      onComplete: () => (el.textContent = format(value)),
    });
    return () => tween.kill();
  }, [value, format]);

  return (
    <span ref={ref} className={className} {...rest}>
      {format(value)}
    </span>
  );
}
