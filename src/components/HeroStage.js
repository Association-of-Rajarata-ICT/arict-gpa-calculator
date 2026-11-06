"use client";

import dynamic from "next/dynamic";

// three.js is large; it loads after the page is interactive and never on the server.
const HeroScene = dynamic(() => import("./motion/HeroScene"), { ssr: false });

// The hero backdrop shared by the home and calculator pages. The WebGL horizon rises behind the element
// with id `anchorId`; a CSS glow stands in without WebGL. It follows the site theme.
export default function HeroStage({ anchorId, children }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-paper">
      <div className="hero-grid pointer-events-none absolute inset-0 -z-20" aria-hidden />
      <div className="hero-fallback-glow pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[70%]" aria-hidden />
      <HeroScene anchorId={anchorId} />
      <div className="container-page pt-36 pb-16 sm:pt-44 sm:pb-24">{children}</div>
    </section>
  );
}
