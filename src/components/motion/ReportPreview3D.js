"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { gsap, reducedMotion } from "@/lib/motion";

// The exported PDF as a sheet of paper floating in 3D. The sheet is cut into vertical strips hinged to
// each other, and a travelling sine wave bends the hinges, so the page ripples like paper in a breeze.
// Each strip shows its slice of the same drawing, and a light/shade overlay follows its angle.

const STRIPS = 14;

export default function ReportPreview3D() {
  const stageRef = useRef(null);
  const tiltRef = useRef(null);
  const badgeRef = useRef(null);
  const shadowRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;

    const hinges = [...stage.querySelectorAll("[data-hinge]")];
    const shades = [...stage.querySelectorAll("[data-shade]")];

    const size = () => stage.style.setProperty("--sw", `${stage.clientWidth / STRIPS}px`);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(stage);

    const wave = { amp: 9 };
    const pointer = { x: 0, y: 0 };
    const px = gsap.quickTo(pointer, "x", { duration: 1.2, ease: "power3.out" });
    const py = gsap.quickTo(pointer, "y", { duration: 1.2, ease: "power3.out" });

    const host = stage.parentElement;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      px((e.clientX - r.left) / r.width - 0.5);
      py((e.clientY - r.top) / r.height - 0.5);
    };
    // Hovering calms the paper so it can be read; leaving lets it ripple again.
    const onEnter = () => gsap.to(wave, { amp: 2.5, duration: 1.2, ease: "power2.out" });
    const onLeave = () => {
      gsap.to(wave, { amp: 9, duration: 1.6, ease: "power2.out" });
      px(0);
      py(0);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);

    // Strips turned away from the light darken, strips turned toward it brighten. Each strip's shade is a
    // gradient between its two edges, so the light rolls smoothly across the page instead of in bands.
    const tone = (a) => {
      const s = a / 9;
      return s > 0 ? `rgba(0,0,0,${(s * 0.16).toFixed(3)})` : `rgba(255,255,255,${(-s * 0.22).toFixed(3)})`;
    };
    const angles = new Array(STRIPS).fill(0);

    function pose(t) {
      for (let i = 0; i < STRIPS; i++) {
        // Absolute angle of strip i; each hinge turns by the difference from its neighbour.
        const edge = 0.35 + 0.65 * (i / (STRIPS - 1));
        angles[i] = wave.amp * edge * Math.sin(t * 1.5 - i * 0.48);
        hinges[i].style.transform = `rotateY(${i === 0 ? angles[i] : angles[i] - angles[i - 1]}deg)`;
      }
      for (let i = 0; i < STRIPS; i++) {
        const left = i === 0 ? angles[0] : (angles[i - 1] + angles[i]) / 2;
        const right = i === STRIPS - 1 ? angles[i] : (angles[i] + angles[i + 1]) / 2;
        shades[i].style.background = `linear-gradient(to right, ${tone(left)}, ${tone(right)})`;
      }
      const float = Math.sin(t * 0.9);
      tilt.style.transform =
        `translateY(${float * 10}px) rotateX(${8 - pointer.y * 14}deg) rotateY(${-16 + pointer.x * 22}deg) rotateZ(${1.5 + float * 0.6}deg)`;
      if (badgeRef.current) badgeRef.current.style.transform = `translate3d(${pointer.x * -18}px, ${Math.sin(t * 0.9 + 1.4) * 12}px, 0)`;
      if (shadowRef.current) shadowRef.current.style.transform = `scale(${1 - float * 0.06})`;
      if (shadowRef.current) shadowRef.current.style.opacity = String(0.55 - float * 0.12);
    }

    if (reducedMotion()) {
      wave.amp = 3;
      pose(0.8);
      return () => ro.disconnect();
    }

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" });
    io.observe(host);
    const start = performance.now();
    const tick = () => visible && pose((performance.now() - start) / 1000);
    pose(0);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Builds the hinge chain from the inside out: strip i holds its face and strip i + 1.
  let chain = null;
  for (let i = STRIPS - 1; i >= 0; i--) {
    chain = (
      <div
        data-hinge
        className="absolute top-0 h-full [transform-style:preserve-3d]"
        style={{ left: i === 0 ? 0 : "var(--sw)", width: "var(--sw)", transformOrigin: "0 50%" }}
      >
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: i === STRIPS - 1 ? "var(--sw)" : "calc(var(--sw) + 1px)" }}>
          <div className="absolute top-0 h-full" style={{ width: `calc(var(--sw) * ${STRIPS})`, left: `calc(var(--sw) * ${-i})` }}>
            <ReportSheet />
          </div>
          <div data-shade className="absolute inset-0" />
        </div>
        {chain}
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[25rem] [perspective:1600px] lg:mr-0" aria-hidden>
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-brand/25 blur-3xl" />
      <div ref={shadowRef} className="absolute inset-x-[10%] -bottom-10 -z-10 h-12 rounded-[50%] bg-black/50 blur-2xl dark:bg-black/80" />

      <div ref={tiltRef} className="[transform-style:preserve-3d] will-change-transform">
        <div ref={stageRef} className="relative aspect-[1/1.414] w-full [transform-style:preserve-3d]">
          {chain}
        </div>
      </div>

      <div
        ref={badgeRef}
        className="absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-2xl border border-line bg-surface/90 px-3.5 py-2.5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)] backdrop-blur-md sm:-left-8"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-good/15 text-good">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-ink">Grades restored</span>
          <span className="block text-[11.5px] text-muted">from your PDF report</span>
        </span>
      </div>
    </div>
  );
}

// A drawn miniature of the exported PDF. Paper stays white in both themes, like the real file.
function ReportSheet() {
  const bars = [62, 70, 66, 78, 84, 0, 0, 0];
  return (
    <div className="h-full overflow-hidden rounded-xl bg-white text-[#0b0b0b] ring-1 ring-black/5">
      <div className="relative overflow-hidden bg-[#0b0b0b] px-[7%] pt-[6%] pb-[5%] text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[#e5484d]" />
        <div className="absolute -top-16 -right-10 size-40 rounded-full bg-[#a00000]/50 blur-2xl" />
        <div className="relative flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arict-wordmark-light.png" alt="" className="h-3 w-auto" draggable={false} />
          <div className="text-right">
            <div className="text-[6px] font-bold tracking-[0.2em] text-white/55">GPA REPORT</div>
            <div className="text-[7px] font-bold text-[#e5484d]">gpa.arict.lk</div>
          </div>
        </div>
        <div className="relative mt-4 font-display text-[15px] font-bold tracking-tight">Academic GPA Report</div>
        <div className="relative text-[7px] text-white/60">Computing · BSc / BSc Honours in Information Technology</div>
        <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-2">
          {[
            ["STUDENT", "K. M. Perera"],
            ["REG. NO.", "ICT/2022/074"],
            ["EXPORTED", "6 Nov 2026"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[5px] font-bold tracking-[0.15em] text-white/45">{k}</div>
              <div className="text-[7.5px] font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_1fr] gap-2 px-[7%] pt-[5%]">
        <div className="rounded-lg bg-[#0b0b0b] p-2.5 text-white">
          <div className="text-[5px] font-bold tracking-[0.15em] text-white/55">OVERALL GPA</div>
          <div className="font-display text-[26px] leading-none font-extrabold tracking-tight">3.72</div>
          <div className="mt-1.5 h-[3px] rounded-full bg-white/15">
            <div className="h-full w-[93%] rounded-full bg-[#e5484d]" />
          </div>
          <div className="mt-1.5 inline-block rounded-full bg-white px-1.5 py-px text-[5.5px] font-bold text-[#0b0b0b]">First Class</div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["68", "41", "3.84", "5 / 8"].map((v) => (
            <div key={v} className="rounded-md border border-[#e6e6e6] bg-[#f6f6f7] p-1.5">
              <div className="h-[3px] w-3/5 rounded-full bg-[#d9d9d9]" />
              <div className="mt-1 text-[10px] font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[7%] pt-[5%]">
        <div className="text-[5px] font-bold tracking-[0.15em] text-[#a00000]">PROGRESS</div>
        <div className="text-[9px] font-bold">Semester GPA</div>
        <div className="mt-2 flex h-16 items-end justify-between gap-1.5 border-b border-[#d9d9d9] px-1">
          {bars.map((h, i) => (
            <div key={i} className="flex h-full flex-1 items-end">
              <div className="mx-auto w-[55%] rounded-t-[2px] bg-[#a00000]" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-1 px-[7%] pt-[5%]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex items-center gap-2 rounded-sm px-1 py-[3px] ${i % 2 ? "bg-[#f6f6f7]" : ""}`}>
            <div className="h-[3px] w-1/4 rounded-full bg-[#9ca3af]" />
            <div className="h-[3px] flex-1 rounded-full bg-[#e6e6e6]" />
            <div className="h-[3px] w-[8%] rounded-full bg-[#a00000]/70" />
          </div>
        ))}
      </div>

      <div className="mx-[7%] mt-[6%] rounded-md border border-[#e5484d]/50 bg-[#fbeeee] px-2 py-1.5">
        <div className="text-[6.5px] font-bold text-[#a00000]">Keep this file</div>
        <div className="mt-1 h-[3px] w-4/5 rounded-full bg-[#e9c4c4]" />
        <div className="mt-[3px] h-[3px] w-3/5 rounded-full bg-[#e9c4c4]" />
      </div>
    </div>
  );
}
