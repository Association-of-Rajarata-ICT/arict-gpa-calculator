// The PDF report. It is drawn in the browser with pdf-lib (loaded only when needed) and carries a
// copy of the saved state, so the same file can be uploaded later to restore every grade.
// Nothing here talks to a server.
import {
  buildCourses,
  classFor,
  CLASSES,
  computeGpa,
  computeTerms,
  countedCourses,
  displayCode,
  formatGpa,
  getDepartment,
  GRADE_POINTS,
  GRADES,
  nextClass,
  ROMAN,
  customOrigin,
  trackYears,
  YEARS,
} from "@/lib/gpa";
import { DEPARTMENTS } from "@/data/departments";
import { buildPlan } from "@/lib/planner";
import { EMPTY_DEPT_DATA, sanitize } from "@/lib/storage";

const APP_ID = "arict-gpa-calculator";
const DATA_KEY = "ARICTGPABackup"; // custom key in the PDF's document info dictionary
const ATTACHMENT = "arict-gpa-backup.json"; // same data, as a file attachment (survives more PDF tools)

const W = 595.28; // A4, in points
const H = 841.89;
const M = 44;
const CW = W - 2 * M;
const FOOT = 58;
const BAND = 188;

const HEX = {
  ink: "#0b0b0b",
  body: "#374151",
  muted: "#6b7280",
  line: "#e6e6e6",
  mist: "#f6f6f7",
  brand: "#a00000",
  bright: "#e5484d",
  soft: "#fbeeee",
  white: "#ffffff",
};

export class BackupError extends Error {}

/** Builds the report for the selected department and returns { bytes, filename }. */
export async function createReport(state, { name = "", regNo = "" } = {}) {
  const { PDFDocument, StandardFonts, rgb, PDFName, PDFHexString } = await import("pdf-lib");

  const dept = getDepartment(state.dept);
  if (!dept) throw new Error("Choose a department first.");
  const data = state.data[dept.id] || EMPTY_DEPT_DATA;
  const hidden = new Set(data.hidden);
  const allActive = buildCourses(dept, data).filter((c) => !hidden.has(c.id));
  // A BSc counts Years 1-3 only; Honours, or no choice yet, counts all four.
  const active = countedCourses(allActive, data.track);
  const grades = data.grades;
  const terms = computeTerms(active, grades, trackYears(data.track));
  const overall = computeGpa(active, grades);
  const band = classFor(overall.gpa);
  const next = nextClass(overall.gpa);
  const now = new Date();
  const dateText = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeText = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const [logoLight, logoDark] = await Promise.all([
    fetchBytes("/brand/arict-wordmark-light.png").then((b) => doc.embedPng(b)),
    fetchBytes("/brand/arict-wordmark.png").then((b) => doc.embedPng(b)),
  ]);

  const C = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [k, hexToRgb(rgb, v)]));
  name = clean(name, regular).trim();
  regNo = clean(regNo, regular).trim();

  // ---- drawing primitives (all positions measured from the top of the page) ----
  let page;
  let y = 0;
  const pages = [];

  const fontOf = (o) => (o.bold ? bold : regular);
  function text(str, x, baseline, o = {}) {
    const font = fontOf(o);
    const s = clean(str, font);
    if (!s) return 0;
    page.drawText(s, { x, y: H - baseline, size: o.size || 9, font, color: o.color || C.body, opacity: o.opacity ?? 1 });
    return font.widthOfTextAtSize(s, o.size || 9);
  }
  function width(str, o = {}) {
    const font = fontOf(o);
    return font.widthOfTextAtSize(clean(str, font), o.size || 9);
  }
  function textRight(str, right, baseline, o = {}) {
    text(str, right - width(str, o), baseline, o);
  }
  // Letter-spaced capitals for labels; pdf-lib has no tracking option, so draw letter by letter.
  function spacedWidth(str, o) {
    const s = clean(str, fontOf(o));
    return [...s].reduce((w, ch) => w + width(ch, o), 0) + Math.max(0, [...s].length - 1) * (o.tracking ?? 1);
  }
  function spaced(str, x, baseline, o = {}) {
    let cx = x;
    for (const ch of clean(str, fontOf(o))) {
      text(ch, cx, baseline, o);
      cx += width(ch, o) + (o.tracking ?? 1);
    }
  }
  function spacedRight(str, right, baseline, o = {}) {
    spaced(str, right - spacedWidth(str, o), baseline, o);
  }
  function rect(x, top, w, h, o = {}) {
    page.drawRectangle({ x, y: H - top - h, width: w, height: h, color: o.color, opacity: o.opacity ?? 1 });
  }
  function rrect(x, top, w, h, r, o = {}) {
    r = Math.min(r, h / 2, w / 2);
    const path = `M${r},0 H${w - r} Q${w},0 ${w},${r} V${h - r} Q${w},${h} ${w - r},${h} H${r} Q0,${h} 0,${h - r} V${r} Q0,0 ${r},0 Z`;
    page.drawSvgPath(path, {
      x,
      y: H - top,
      color: o.color,
      opacity: o.opacity ?? 1,
      borderColor: o.border,
      borderWidth: o.border ? o.borderWidth || 0.75 : 0,
    });
  }
  function line(x1, t1, x2, t2, o = {}) {
    page.drawLine({
      start: { x: x1, y: H - t1 },
      end: { x: x2, y: H - t2 },
      thickness: o.thickness ?? 0.6,
      color: o.color || C.line,
      opacity: o.opacity ?? 1,
      dashArray: o.dash,
    });
  }
  // A soft radial glow, faked with stacked translucent circles.
  function glow(cx, ctop, radius, color, steps = 14, each = 0.035) {
    for (let i = 0; i < steps; i++) {
      page.drawCircle({ x: cx, y: H - ctop, size: radius * (1 - i / steps), color, opacity: each });
    }
  }
  function wrap(str, o, maxW) {
    const words = clean(str, fontOf(o)).split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const tryLine = cur ? `${cur} ${w}` : w;
      if (width(tryLine, o) <= maxW || !cur) cur = tryLine;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function fit(str, o, maxW) {
    let s = clean(str, fontOf(o));
    if (width(s, o) <= maxW) return s;
    while (s && width(`${s}…`, o) > maxW) s = s.slice(0, -1);
    return `${s.trimEnd()}…`;
  }

  function newPage() {
    page = doc.addPage([W, H]);
    pages.push(page);
    if (pages.length === 1) {
      y = 0;
      return;
    }
    // Running header on continuation pages.
    rect(0, 0, W, 3, { color: C.bright });
    const lh = 13;
    page.drawImage(logoDark, { x: M, y: H - 26 - lh, width: (lh * logoDark.width) / logoDark.height, height: lh });
    textRight(`GPA Report  ·  ${dept.name}${name ? `  ·  ${name}` : ""}`, W - M, 36, { size: 8, color: C.muted });
    line(M, 50, W - M, 50);
    y = 74;
  }
  function ensure(h, onBreak) {
    if (y + h > H - FOOT) {
      newPage();
      onBreak?.();
    }
  }
  // `keep` is the space the content right after the title needs, so a title never ends a page alone.
  function sectionTitle(eyebrow, title, caption, keep = 0) {
    ensure((caption ? 64 : 50) + keep);
    spaced(eyebrow, M, y + 9, { size: 7, bold: true, color: C.brand, tracking: 1.4 });
    text(title, M, y + 28, { size: 16, bold: true, color: C.ink });
    y += 36;
    if (caption) {
      text(caption, M, y + 4, { size: 8.5, color: C.muted });
      y += 16;
    }
    y += 6;
  }

  // ---- page 1: header band ----
  newPage();
  rect(0, 0, W, BAND, { color: C.ink });
  for (let gx = 0; gx <= W; gx += 24) line(gx, 0, gx, BAND, { color: C.white, opacity: 0.05, thickness: 0.4 });
  for (let gy = 0; gy <= BAND; gy += 24) line(0, gy, W, gy, { color: C.white, opacity: 0.05, thickness: 0.4 });
  glow(W - 30, -30, 200, C.brand, 16, 0.05); // stays inside the band
  rect(0, BAND - 1, W, 1, { color: C.bright, opacity: 0.6 });
  rect(0, 0, W, 3, { color: C.bright });

  const logoH = 21;
  page.drawImage(logoLight, { x: M, y: H - 36 - logoH, width: (logoH * logoLight.width) / logoLight.height, height: logoH });
  spacedRight("GPA REPORT", W - M, 46, { size: 7.5, bold: true, color: C.white, opacity: 0.55, tracking: 1.8 });
  textRight("gpa.arict.lk", W - M, 59, { size: 9, bold: true, color: C.bright });

  text("Academic GPA Report", M, 104, { size: 29, bold: true, color: C.white });
  // The programme line names the chosen degree when there is one.
  const programme =
    data.track === "bsc" ? dept.programme.replace("BSc / BSc Honours", "BSc") : data.track === "hons" ? dept.programme.replace("BSc / BSc Honours", "BSc Honours") : dept.programme;
  text(`${dept.name}  ·  ${programme}`, M, 124, { size: 10.5, color: C.white, opacity: 0.68 });

  line(M, 140, W - M, 140, { color: C.white, opacity: 0.14 });
  const meta = [
    name && ["STUDENT", name],
    regNo && ["REGISTRATION NO.", regNo],
    ["FACULTY", "Applied Sciences, RUSL"],
    ["EXPORTED", `${dateText}, ${timeText}`],
  ].filter(Boolean);
  // Columns sized to their content; if they overflow, the widest (usually the name) gives way.
  const metaO = { size: 10.5, bold: true };
  const widths = meta.map(([label, value]) => Math.max(width(value, metaO), spacedWidth(label, { size: 6.5, bold: true, tracking: 1.2 })) + 22);
  const total = widths.reduce((a, b) => a + b, 0);
  if (total <= CW) widths.forEach((w, i) => (widths[i] = w + (CW - total) / widths.length));
  else {
    const wi = widths.indexOf(Math.max(...widths));
    widths[wi] = Math.max(90, widths[wi] - (total - CW));
  }
  let mx = M;
  meta.forEach(([label, value], i) => {
    spaced(label, mx, 157, { size: 6.5, bold: true, color: C.white, opacity: 0.5, tracking: 1.2 });
    text(fit(value, metaO, widths[i] - 14), mx, 172, { ...metaO, color: C.white });
    mx += widths[i];
  });

  // ---- overview: GPA card + stat tiles ----
  y = BAND + 24;
  const cardW = 232;
  const cardH = 152;
  rrect(M, y, cardW, cardH, 14, { color: C.ink });
  rect(M + 18, y, 34, 2.5, { color: C.bright });
  spaced("OVERALL GPA", M + 18, y + 26, { size: 7, bold: true, color: C.white, opacity: 0.55, tracking: 1.4 });
  const gpaText = formatGpa(overall.gpa);
  const gw = text(gpaText, M + 16, y + 80, { size: 50, bold: true, color: C.white });
  text("/ 4.00", M + 22 + gw, y + 80, { size: 11, color: C.white, opacity: 0.45 });
  const barW = cardW - 36;
  rrect(M + 18, y + 94, barW, 5, 2.5, { color: C.white, opacity: 0.12 });
  if (overall.gpa) rrect(M + 18, y + 94, Math.max(5, (barW * overall.gpa) / 4), 5, 2.5, { color: C.bright });
  if (band) {
    const pillW = width(band.label, { size: 8.5, bold: true }) + 18;
    rrect(M + 18, y + 110, pillW, 19, 9.5, { color: C.white });
    text(band.label, M + 27, y + 123, { size: 8.5, bold: true, color: C.ink });
    if (next) text(`${next.gap.toFixed(2)} to ${next.label}`, M + 26 + pillW, y + 123, { size: 8, color: C.white, opacity: 0.6 });
  } else {
    text("No grades entered yet.", M + 18, y + 123, { size: 9, color: C.white, opacity: 0.6 });
  }
  text("Truncated to two decimals, as the handbook does.", M + 18, y + 143, { size: 6.8, color: C.white, opacity: 0.38 });

  const graded = terms.filter((t) => t.gpa != null);
  const best = graded.reduce((b, t) => (!b || t.gpa > b.gpa ? t : b), null);
  const nonGpaGraded = active.filter((c) => grades[c.id] && (c.nonGpa || c.credits <= 0)).length;
  const tiles = [
    ["GPA CREDITS", String(overall.credits), "Counted in your GPA"],
    ["COURSES GRADED", String(overall.graded), nonGpaGraded ? `Includes ${nonGpaGraded} non-GPA` : `Of ${active.length} listed`],
    ["BEST SEMESTER", best ? formatGpa(best.gpa) : "—", best ? `Year ${best.year} · Semester ${ROMAN[best.semester]}` : "No semester graded yet"],
    ["SEMESTERS", `${graded.length} / ${terms.length}`, data.track === "bsc" ? "Of a 3-year BSc" : "With at least one grade"],
  ];
  const tx = M + cardW + 12;
  const tw = (CW - cardW - 12 - 10) / 2;
  const th = (cardH - 10) / 2;
  tiles.forEach(([label, value, sub], i) => {
    const x = tx + (i % 2) * (tw + 10);
    const top = y + Math.floor(i / 2) * (th + 10);
    rrect(x, top, tw, th, 12, { color: C.mist, border: C.line });
    spaced(label, x + 14, top + 19, { size: 6.5, bold: true, color: C.muted, tracking: 1.1 });
    text(value, x + 14, top + 46, { size: 21, bold: true, color: C.ink });
    text(fit(sub, { size: 7.5 }, tw - 28), x + 14, top + 61, { size: 7.5, color: C.muted });
  });
  y += cardH + 28;

  // ---- semester GPA chart ----
  // Bars: each semester's GPA, from zero so heights compare honestly. Line: cumulative GPA.
  // Shaded zones behind are the degree classes, labelled at the right, so each bar reads as a class.
  const legendH = 16;
  const headroom = 18; // room above 4.0 for the BEST tag and the cumulative label
  const plotH = 196;
  const axisH = 34;
  const insightH = 46;
  const chartH = legendH + headroom + plotH + axisH + 14 + insightH;
  sectionTitle(
    "PROGRESS",
    "Semester GPA",
    "Bars show each semester's GPA out of 4.00. The line is your cumulative GPA. Shaded zones are the degree classes.",
    chartH,
  );

  // Legend, top right: two series, both named.
  {
    const lt = y + 8;
    let lx = W - M;
    const items = [
      ["Cumulative GPA", "line"],
      ["Semester GPA", "bar"],
    ];
    for (const [label, kind] of items) {
      lx -= width(label, { size: 7.5 });
      text(label, lx, lt + 2.5, { size: 7.5, color: C.body });
      lx -= 6;
      if (kind === "bar") {
        rrect(lx - 9, lt - 4.5, 9, 9, 2, { color: C.brand });
        lx -= 9;
      } else {
        line(lx - 16, lt, lx, lt, { color: C.ink, thickness: 1.4 });
        page.drawCircle({ x: lx - 8, y: H - lt, size: 2.6, color: C.white, borderColor: C.ink, borderWidth: 1.2 });
        lx -= 16;
      }
      lx -= 16;
    }
  }

  const plotX = M + 24;
  const plotW = CW - 24 - 78;
  const plotTop = y + legendH + headroom + 6;
  const vy = (v) => plotTop + plotH - (v / 4) * plotH;

  // Class zones, faintest for Pass and strongest for First.
  const ZONE = { "First Class": 0.12, "Second Class (Upper)": 0.08, "Second Class (Lower)": 0.05, Pass: 0.025 };
  const SHORT = { "First Class": "First Class", "Second Class (Upper)": "2nd Upper", "Second Class (Lower)": "2nd Lower", Pass: "Pass" };
  CLASSES.forEach((c, i) => {
    const hi = i === 0 ? 4 : CLASSES[i - 1].min;
    const top = vy(hi);
    const h = vy(c.min) - top;
    rect(plotX, top, plotW, h, { color: C.brand, opacity: ZONE[c.label] ?? 0.04 });
    line(plotX, vy(c.min), plotX + plotW, vy(c.min), { color: C.brand, opacity: 0.35, thickness: 0.5, dash: [2, 2] });
    // The label sits in the middle of its zone, outside the plot.
    const mid = top + h / 2;
    const name = SHORT[c.label] || c.label;
    const lx = plotX + plotW + 8;
    if (h > 20) {
      text(name, lx, mid - 1, { size: 7, bold: true, color: C.ink });
      text(`${c.min.toFixed(2)} and above`, lx, mid + 8, { size: 6.2, color: C.muted });
    } else {
      text(name, lx, mid + 2.4, { size: 7, bold: true, color: C.ink });
      text(c.min.toFixed(2), lx + width(name, { size: 7, bold: true }) + 4, mid + 2.4, { size: 6.2, color: C.muted });
    }
  });

  // Recessive grid and axis.
  for (let v = 0; v <= 4; v++) {
    if (v > 0) line(plotX, vy(v), plotX + plotW, vy(v), { color: C.line, thickness: 0.4 });
    textRight(v.toFixed(1), plotX - 7, vy(v) + 2.5, { size: 7, color: C.muted });
  }

  const slot = plotW / terms.length;
  const bw = Math.min(30, slot * 0.52);
  const latest = graded[graded.length - 1];
  const cx = (i) => plotX + slot * i + slot / 2;

  terms.forEach((t, i) => {
    const x = cx(i);
    if (t.gpa != null && t.gpa > 0) {
      const h = (t.gpa / 4) * plotH;
      const r = Math.min(4, h);
      const path = `M0,${h} V${r} Q0,0 ${r},0 H${bw - r} Q${bw},0 ${bw},${r} V${h} Z`;
      page.drawSvgPath(path, { x: x - bw / 2, y: H - (plotTop + plotH - h), color: C.brand });
    } else if (t.gpa == null) {
      // Not graded yet: a ghost outline, so empty semesters read as "to come", not as zero.
      rrect(x - bw / 2, plotTop + plotH - 26, bw, 26, 4, { border: C.line, borderWidth: 0.8 });
      const nl = "Not yet";
      text(nl, x - width(nl, { size: 6 }) / 2, plotTop + plotH - 10, { size: 6, color: C.muted });
    }
  });
  line(plotX, vy(0), plotX + plotW, vy(0), { color: C.ink, thickness: 0.8 });

  // Cumulative line over the graded semesters, with ringed dots so it stays readable over the bars.
  const cum = terms.map((t, i) => ({ t, i })).filter(({ t }) => t.gpa != null && t.cumulative != null);
  for (let k = 1; k < cum.length; k++) {
    const a = cum[k - 1];
    const b = cum[k];
    line(cx(a.i), vy(a.t.cumulative), cx(b.i), vy(b.t.cumulative), { color: C.white, thickness: 3.6 });
    line(cx(a.i), vy(a.t.cumulative), cx(b.i), vy(b.t.cumulative), { color: C.ink, thickness: 1.5 });
  }
  cum.forEach(({ t, i }) => page.drawCircle({ x: cx(i), y: H - vy(t.cumulative), size: 3, color: C.white, borderColor: C.ink, borderWidth: 1.4 }));

  // Bar values go on top of everything. Each sits inside its bar, below the cumulative dot when the
  // dot would cover it, and the BEST tag clears both the bar and the dot.
  terms.forEach((t, i) => {
    if (t.gpa == null || t.gpa <= 0) return;
    const x = cx(i);
    const barTop = vy(t.gpa);
    const base = plotTop + plotH;
    const dotY = t.cumulative != null ? vy(t.cumulative) : null;
    const label = formatGpa(t.gpa);
    const lo = { size: 8.5, bold: true };
    let ly = barTop + 14; // baseline
    if (dotY != null && Math.abs(ly - 3 - dotY) < 10) ly = dotY + 15;
    if (ly < base - 4) text(label, x - width(label, lo) / 2, ly, { ...lo, color: C.white });
    else text(label, x - width(label, lo) / 2, barTop - 6, { ...lo, color: C.ink });
    if (t === best && graded.length > 1) {
      const tag = "BEST";
      const tagO = { size: 5.5, bold: true, tracking: 0.8 };
      const tagW = spacedWidth(tag, tagO) + 9;
      const tagTop = Math.min(barTop, dotY != null ? dotY - 4 : barTop) - 15;
      rrect(x - tagW / 2, tagTop, tagW, 10.5, 5.25, { color: C.ink });
      spaced(tag, x - tagW / 2 + 4.5, tagTop + 7.3, { ...tagO, color: C.white });
    }
  });
  if (cum.length) {
    const last = cum[cum.length - 1];
    const lbl = `Cumulative ${formatGpa(last.t.cumulative)}`;
    const lo = { size: 7, bold: true };
    const lw = width(lbl, lo) + 10;
    // Beside the last dot when there is room to its right, otherwise just above it.
    const dx = cx(last.i);
    const dy = vy(last.t.cumulative);
    const beside = dx + 10 + lw <= plotX + plotW;
    const lx = beside ? dx + 10 : dx - lw - 14;
    const ly = beside ? dy - 6.5 : dy - 20;
    rrect(lx, ly, lw, 13, 3.5, { color: C.ink });
    text(lbl, lx + 5, ly + 9.2, { ...lo, color: C.white });
  }

  // Axis: semester on the first line, the year grouped underneath.
  const axisTop = plotTop + plotH;
  terms.forEach((t, i) => {
    const lab = `Sem ${ROMAN[t.semester]}`;
    const o = { size: 7.5, bold: true };
    text(lab, cx(i) - width(lab, o) / 2, axisTop + 13, { ...o, color: t.gpa != null ? C.ink : C.muted });
  });
  [...new Set(terms.map((t) => t.year))].forEach((yr, k) => {
    const a = cx(k * 2) - slot / 2 + 6;
    const b = cx(k * 2 + 1) + slot / 2 - 6;
    line(a, axisTop + 19, b, axisTop + 19, { color: C.line, thickness: 0.6 });
    const yl = `YEAR ${yr}`;
    const o = { size: 6.2, bold: true, tracking: 1.1 };
    spaced(yl, (a + b) / 2 - spacedWidth(yl, o) / 2, axisTop + 29, { ...o, color: C.muted });
  });

  // The takeaways, in words, under the chart.
  {
    const top = axisTop + axisH + 14;
    rrect(M, top, CW, insightH, 10, { color: C.mist, border: C.line });
    const first = graded[0];
    const change = first && latest && first !== latest ? latest.gpa - first.gpa : null;
    const termName = (t) => `Year ${t.year} · Semester ${ROMAN[t.semester]}`;
    const cells = [
      ["LATEST SEMESTER", latest ? formatGpa(latest.gpa) : "—", latest ? termName(latest) : "No semester graded yet"],
      [
        "CHANGE SINCE FIRST",
        change == null ? "—" : `${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(2)}`,
        change == null ? "Needs two graded semesters" : `From ${formatGpa(first.gpa)} in Y${first.year} S${ROMAN[first.semester]}`,
      ],
      ["BEST SEMESTER", best ? formatGpa(best.gpa) : "—", best ? termName(best) : "No semester graded yet"],
      ["CUMULATIVE NOW", formatGpa(overall.gpa), band ? band.label : "Enter a grade to see your class"],
    ];
    const cw = CW / cells.length;
    cells.forEach(([label, value, sub], i) => {
      const x = M + i * cw + 14;
      if (i > 0) line(M + i * cw, top + 10, M + i * cw, top + insightH - 10, { color: C.line });
      spaced(label, x, top + 14, { size: 5.8, bold: true, color: C.muted, tracking: 1 });
      text(value, x, top + 30, { size: 13, bold: true, color: C.ink });
      text(fit(sub, { size: 6.5 }, cw - 24), x, top + 40, { size: 6.5, color: C.muted });
    });
  }
  y += chartH + 18;

  // ---- semester table ----
  sectionTitle("BREAKDOWN", "Semester by semester", null, 16 + 16.5 * terms.length);
  const cols = [
    { label: "SEMESTER", x: M + 10, align: "left" },
    { label: "COURSES GRADED", x: M + CW * 0.46, align: "right" },
    { label: "GPA CREDITS", x: M + CW * 0.62, align: "right" },
    { label: "SEMESTER GPA", x: M + CW * 0.8, align: "right" },
    { label: "CUMULATIVE GPA", x: M + CW - 10, align: "right" },
  ];
  cols.forEach((c) =>
    c.align === "left"
      ? spaced(c.label, c.x, y + 8, { size: 6.5, bold: true, color: C.muted, tracking: 1 })
      : spacedRight(c.label, c.x, y + 8, { size: 6.5, bold: true, color: C.muted, tracking: 1 }),
  );
  y += 14;
  line(M, y, W - M, y, { color: C.ink, thickness: 0.8 });
  terms.forEach((t, i) => {
    const rowH = 16.5;
    if (i % 2 === 1) rect(M, y, CW, rowH, { color: C.mist });
    const has = t.graded > 0;
    const o = { size: 9, color: has ? C.ink : C.muted };
    const b = y + 11.5;
    text(`Year ${t.year}  ·  Semester ${ROMAN[t.semester]}`, cols[0].x, b, { ...o, bold: has });
    textRight(has ? String(t.graded) : "—", cols[1].x, b, o);
    textRight(has ? String(t.credits) : "—", cols[2].x, b, o);
    textRight(formatGpa(t.gpa), cols[3].x, b, { ...o, bold: has, color: t.gpa != null ? C.brand : C.muted });
    textRight(formatGpa(t.cumulative), cols[4].x, b, { ...o, bold: t.cumulative != null });
    y += rowH;
  });
  line(M, y, W - M, y, { color: C.line });
  y += 26;

  // ---- next-class plan ----
  const plan = buildPlan({ courses: allActive, grades, track: data.track || "hons", targets: data.targets, goalLabel: data.goal });
  if (plan.goal && (data.track === "bsc" || data.track === "hons")) {
    const PLAN_SHORT = { "First Class": "First Class", "Second Class (Upper)": "Second Upper", "Second Class (Lower)": "Second Lower", Pass: "Pass" };
    sectionTitle(
      "PLAN",
      `Your path to ${plan.goal.label}`,
      `${plan.track.long}: ${plan.doneCredits} GPA credits graded, ${plan.remCredits} to come. GPA cut-offs only; classes also need minimum grades.`,
      150,
    );

    // What each class needs, as a table.
    const pc = { cls: M + 12, cut: M + CW * 0.36, need: M + CW * 0.58, words: M + CW * 0.62 };
    const ho = { size: 6.3, bold: true, color: C.muted, tracking: 1 };
    spaced("CLASS", pc.cls, y + 8, ho);
    spacedRight("FROM", pc.cut, y + 8, ho);
    spacedRight("AVERAGE NEEDED", pc.need, y + 8, ho);
    spaced("WHAT THAT MEANS", pc.words, y + 8, ho);
    y += 14;
    line(M, y, W - M, y, { color: C.ink, thickness: 0.8 });
    plan.ladder.forEach((l) => {
      const rowH = 19;
      const isGoal = l.label === plan.goal.label;
      const here = plan.currentClass?.label === l.label;
      if (isGoal) rrect(M, y + 1, CW, rowH - 2, 5, { color: C.soft });
      const b = y + 12.5;
      const nameO = { size: 9, bold: true, color: C.ink };
      text(PLAN_SHORT[l.label] || l.label, pc.cls, b, nameO);
      let tagX = pc.cls + width(PLAN_SHORT[l.label] || l.label, nameO) + 6;
      const tag = (label, bg) => {
        const tw3 = spacedWidth(label, { size: 5.3, bold: true, tracking: 0.6 }) + 8;
        rrect(tagX, y + 5, tw3, 10, 5, { color: bg });
        spaced(label, tagX + 4, y + 12, { size: 5.3, bold: true, color: C.white, tracking: 0.6 });
        tagX += tw3 + 4;
      };
      if (isGoal) tag("GOAL", C.brand);
      if (here) tag("NOW", C.ink);
      textRight(l.min.toFixed(2), pc.cut, b, { size: 9, color: C.body });
      const needText = l.status === "possible" ? l.need.toFixed(2) : "—";
      textRight(needText, pc.need, b, { size: 9, bold: l.status === "possible", color: l.status === "possible" ? C.ink : C.muted });
      const words =
        l.status === "secured"
          ? plan.remCredits
            ? "Secured: C or better in the rest keeps it"
            : "Secured"
          : l.status === "possible"
            ? `About ${l.words} in every remaining course`
            : plan.remCredits
              ? `Out of reach: the highest possible is ${formatGpa(plan.best)}`
              : "Out of reach";
      text(fit(words, { size: 8.4 }, W - M - 10 - pc.words), pc.words, b, { size: 8.4, color: l.status === "secured" ? C.good : C.body });
      y += rowH;
    });
    line(M, y, W - M, y, { color: C.line });
    y += 14;

    if (plan.remaining.length) {
      // The projection, in one line.
      ensure(40);
      const on = plan.projected != null && plan.projected >= plan.goal.min;
      rrect(M, y, CW, 30, 8, { color: on ? C.ink : C.soft, border: on ? undefined : C.bright });
      text("WITH THE GRADES BELOW", M + 14, y + 12, { size: 6, bold: true, color: on ? C.white : C.brand, opacity: on ? 0.6 : 1 });
      text(`Final GPA ${formatGpa(plan.projected)}${plan.projectedClass ? `  ·  ${plan.projectedClass.label}` : ""}`, M + 14, y + 23.5, {
        size: 10,
        bold: true,
        color: on ? C.white : C.ink,
      });
      const verdict = on ? `On track for ${plan.goal.label}` : `${Math.max(0, plan.goal.min - plan.projected).toFixed(2)} short of ${plan.goal.label}`;
      textRight(verdict, W - M - 14, y + 19, { size: 8.5, bold: true, color: on ? C.bright : C.brand });
      y += 30 + 16;

      // Target grades, by semester, two courses to a row.
      const byTerm = new Map();
      for (const c of plan.remaining) {
        const key = `${c.year}-${c.semester}`;
        if (!byTerm.has(key)) byTerm.set(key, { year: c.year, semester: c.semester, courses: [] });
        byTerm.get(key).courses.push(c);
      }
      const groups = [...byTerm.values()].sort((a, b) => a.year - b.year || a.semester - b.semester);
      const colW = (CW - 14) / 2;
      const rowH = 15;
      for (const g of groups) {
        const rows = Math.ceil(g.courses.length / 2);
        ensure(20 + rowH * Math.min(rows, 3));
        text(`Year ${g.year}  ·  Semester ${ROMAN[g.semester]}`, M, y + 10, { size: 8.6, bold: true, color: C.ink });
        const credits = g.courses.reduce((s, c) => s + c.credits, 0);
        textRight(`${g.courses.length} ${g.courses.length === 1 ? "course" : "courses"}  ·  ${credits} credits`, W - M, y + 10, { size: 7, color: C.muted });
        y += 15;
        line(M, y, W - M, y, { color: C.ink, thickness: 0.6 });
        for (let r = 0; r < rows; r++) {
          ensure(rowH);
          if (r % 2 === 1) rect(M, y, CW, rowH, { color: C.mist });
          for (let side = 0; side < 2; side++) {
            const c = g.courses[r * 2 + side];
            if (!c) continue;
            const x0 = M + side * (colW + 14);
            const b = y + 10.5;
            text(displayCode(c.code), x0 + 6, b, { size: 7.6, bold: true, color: C.brand });
            text(fit(c.title, { size: 7.6 }, colW - 6 - 50 - 58), x0 + 52, b, { size: 7.6, color: C.body });
            textRight(`${c.credits} cr`, x0 + colW - 34, b, { size: 7, color: C.muted });
            const gr = plan.planned[c.id];
            const gw2 = width(gr, { size: 8, bold: true }) + 10;
            rrect(x0 + colW - 4 - gw2, y + 2.5, gw2, 10.5, 3, { border: C.ink, borderWidth: 0.6 });
            text(gr, x0 + colW - 4 - gw2 + 5, y + 10.4, { size: 8, bold: true, color: C.ink });
          }
          y += rowH;
        }
        y += 10;
      }
      text(
        plan.edited
          ? "Grades you changed in the planner are used above; the rest are the planner's suggestions."
          : "Suggested grades: one grade for most courses, a step higher where credits are highest, never below C.",
        M,
        y + 2,
        { size: 7, color: C.muted },
      );
      y += 22;
    }
  }

  // ---- every graded course, by semester ----
  sectionTitle("COURSES", "Every graded course", "Grade point × credits gives the weighted points that make up each GPA.", 80);
  const cc = {
    code: M + 10,
    title: M + 72,
    titleW: CW * 0.5,
    credits: M + CW * 0.68,
    grade: M + CW * 0.77,
    point: M + CW * 0.865,
    weighted: M + CW - 10,
  };
  // Left edge of the grade letter: a fixed column, a little left of where right-aligned grades used to end.
  const gradeLetterX = cc.grade - 9;
  function courseHeader() {
    spaced("CODE", cc.code, y + 8, { size: 6.3, bold: true, color: C.muted, tracking: 1 });
    spaced("COURSE", cc.title, y + 8, { size: 6.3, bold: true, color: C.muted, tracking: 1 });
    spacedRight("CREDITS", cc.credits, y + 8, { size: 6.3, bold: true, color: C.muted, tracking: 1 });
    // GRADE is centred over the letters below it.
    const gh = { size: 6.3, bold: true, tracking: 1 };
    spaced("GRADE", gradeLetterX + 3.2 - spacedWidth("GRADE", gh) / 2, y + 8, { ...gh, color: C.muted });
    spacedRight("POINT", cc.point, y + 8, { size: 6.3, bold: true, color: C.muted, tracking: 1 });
    spacedRight("WEIGHTED", cc.weighted, y + 8, { size: 6.3, bold: true, color: C.muted, tracking: 1 });
    y += 13;
    line(M, y, W - M, y, { color: C.line });
  }
  if (!graded.length && !terms.some((t) => t.graded)) {
    text("No grades entered yet. Pick a grade for each course you sat, then export again.", M, y + 10, { size: 9.5, color: C.muted });
    y += 28;
  }
  for (const t of terms) {
    const inTerm = active.filter((c) => c.year === t.year && c.semester === t.semester);
    const done = inTerm.filter((c) => grades[c.id] in GRADE_POINTS);
    if (!done.length) continue;
    const termLabel = `Year ${t.year}  ·  Semester ${ROMAN[t.semester]}`;
    ensure(28 + 14 + 22);
    rrect(M, y, CW, 26, 8, { color: C.ink });
    rect(M, y + 7, 3, 12, { color: C.bright });
    text(termLabel, M + 14, y + 16.8, { size: 10, bold: true, color: C.white });
    const right = `${t.credits} GPA credits  ·  ${done.length} graded`;
    const gpaLabel = `GPA ${formatGpa(t.gpa)}`;
    const gpaW = width(gpaLabel, { size: 10, bold: true });
    text(gpaLabel, W - M - 12 - gpaW, y + 16.8, { size: 10, bold: true, color: C.bright });
    textRight(right, W - M - 24 - gpaW, y + 16.6, { size: 8, color: C.white, opacity: 0.6 });
    y += 32;
    courseHeader();
    for (const c of done) {
      const g = grades[c.id];
      const counts = !(c.nonGpa || c.credits <= 0);
      const tags = [c.nonGpa ? "Non-GPA" : null, customOrigin(c)].filter(Boolean).join(" · ");
      const lines = wrap(c.title || "Untitled course", { size: 8.6 }, cc.titleW);
      const rowH = lines.length * 11 + (tags ? 10 : 0) + 9;
      ensure(rowH, () => {
        text(`${termLabel} (continued)`, M, y + 8, { size: 8.5, bold: true, color: C.ink });
        y += 16;
        courseHeader();
      });
      const base = y + 13;
      text(displayCode(c.code), cc.code, base, { size: 8.6, bold: true, color: C.ink });
      lines.forEach((l, li) => text(l, cc.title, base + li * 11, { size: 8.6, color: C.body }));
      if (tags) text(tags, cc.title, base + lines.length * 11 - 0.5, { size: 6.8, bold: true, color: C.brand });
      textRight(String(c.credits), cc.credits, base, { size: 8.6, color: C.body });
      // Letters line up in one column and the + or - hangs to the right, so A, B- and B+ read evenly.
      const go = { size: 9, bold: true, color: C.ink };
      const letterW = width(g[0], go);
      text(g[0], gradeLetterX + (6.4 - letterW) / 2, base, go);
      if (g.length > 1) text(g.slice(1), gradeLetterX + 6.4 + 0.4, base, go);
      textRight(GRADE_POINTS[g].toFixed(2), cc.point, base, { size: 8.6, color: C.body });
      textRight(counts ? (GRADE_POINTS[g] * c.credits).toFixed(2) : "—", cc.weighted, base, { size: 8.6, bold: counts, color: counts ? C.ink : C.muted });
      y += rowH;
      line(M, y, W - M, y, { color: C.line, thickness: 0.4 });
    }
    const missing = inTerm.length - done.length;
    if (missing > 0) {
      ensure(16);
      text(`${missing} more ${missing === 1 ? "course is" : "courses are"} listed for this semester without a grade.`, M + 10, y + 12, {
        size: 7.6,
        color: C.muted,
      });
      y += 16;
    }
    y += 16;
  }

  // ---- grading scale, class bands, about ----
  sectionTitle("REFERENCE", "How it's calculated", null, 140);
  const boxH = 132;
  const leftW = CW * 0.58;
  rrect(M, y, leftW, boxH, 12, { color: C.mist, border: C.line });
  text("Grade points", M + 14, y + 20, { size: 9.5, bold: true, color: C.ink });
  const gCols = 6;
  const gw2 = (leftW - 28 - (gCols - 1) * 6) / gCols;
  GRADES.forEach((g, i) => {
    const gx = M + 14 + (i % gCols) * (gw2 + 6);
    const gt = y + 32 + Math.floor(i / gCols) * 40;
    rrect(gx, gt, gw2, 34, 7, { color: C.white, border: C.line });
    text(g.grade, gx + gw2 / 2 - width(g.grade, { size: 11, bold: true }) / 2, gt + 15, { size: 11, bold: true, color: C.ink });
    const p = g.points.toFixed(1);
    text(p, gx + gw2 / 2 - width(p, { size: 7.5 }) / 2, gt + 27, { size: 7.5, color: C.muted });
  });
  text("GPA = Sum(grade point × credits) / Sum(credits), truncated to two decimals.", M + 14, y + boxH - 12, { size: 7.3, color: C.muted });

  const rx = M + leftW + 10;
  const rw = CW - leftW - 10;
  rrect(rx, y, rw, boxH, 12, { color: C.mist, border: C.line });
  text("Class bands", rx + 14, y + 20, { size: 9.5, bold: true, color: C.ink });
  CLASSES.forEach((c, i) => {
    const ly = y + 42 + i * 20;
    const on = band && band.label === c.label;
    if (on) rrect(rx + 8, ly - 13, rw - 16, 19, 6, { color: C.soft });
    text(c.label, rx + 14, ly, { size: 8.6, bold: on, color: on ? C.brand : C.body });
    textRight(`from ${c.min.toFixed(2)}`, rx + rw - 14, ly, { size: 8.6, bold: on, color: on ? C.brand : C.muted });
  });
  text("Classes also need minimum grades and credits.", rx + 14, y + boxH - 12, { size: 6.8, color: C.muted });
  y += boxH + 14;

  // The backup note: this file restores the student's grades.
  const others = DEPARTMENTS.filter((d) => d.id !== dept.id && state.data[d.id] && Object.keys(state.data[d.id].grades || {}).length);
  const noteLines = wrap(
    "This PDF is also your backup. If your browser data is cleared, open gpa.arict.lk, choose Restore from PDF and pick this file: every grade, moved course and course you added comes back exactly as it was when you exported.",
    { size: 8 },
    CW - 58,
  );
  if (others.length) {
    const list = others
      .map((d) => {
        const dd = state.data[d.id];
        const g = computeGpa(countedCourses(buildCourses(d, dd).filter((c) => !new Set(dd.hidden).has(c.id)), dd.track), dd.grades).gpa;
        return `${d.name}${g != null ? ` (GPA ${formatGpa(g)})` : ""}`;
      })
      .join(", ");
    noteLines.push(...wrap(`Also saved in this file: ${list}.`, { size: 8 }, CW - 58));
  }
  const noteH = 30 + noteLines.length * 11.5;
  ensure(noteH);
  rrect(M, y, CW, noteH, 12, { color: C.soft, border: C.bright, borderWidth: 0.6 });
  rrect(M + 14, y + 13, 20, 20, 10, { color: C.brand });
  text("i", M + 22.3, y + 26.5, { size: 10, bold: true, color: C.white });
  text("Keep this file", M + 44, y + 22, { size: 9.5, bold: true, color: C.brand });
  noteLines.forEach((l, i) => text(l, M + 44, y + 36 + i * 11.5, { size: 8, color: C.body }));
  y += noteH + 14;

  const disclaimer = wrap(
    "This is an unofficial report made with the ARICT GPA Calculator from grades you entered yourself. Your official results are on the EIS. Your final GPA uses your best 90 credits (BSc) or 120 credits (BSc Honours), including all compulsory courses; see the Faculty of Applied Sciences Student Handbook 2022/23 for the full rules.",
    { size: 7.4 },
    CW,
  );
  ensure(disclaimer.length * 10 + 4);
  disclaimer.forEach((l, i) => text(l, M, y + 8 + i * 10, { size: 7.4, color: C.muted }));

  // ---- footer on every page ----
  pages.forEach((p, i) => {
    page = p;
    line(M, H - 38, W - M, H - 38, { color: C.line });
    rect(M, H - 27.5, 5, 5, { color: C.bright });
    text("Exported from gpa.arict.lk", M + 11, H - 23, { size: 7.5, bold: true, color: C.ink });
    text("  ·  ARICT GPA Calculator", M + 11 + width("Exported from gpa.arict.lk", { size: 7.5, bold: true }), H - 23, {
      size: 7.5,
      color: C.muted,
    });
    textRight(`Page ${i + 1} of ${pages.length}`, W - M, H - 23, { size: 7.5, color: C.muted });
  });

  // ---- metadata and the embedded backup ----
  const title = `GPA Report · ${dept.name}${name ? ` · ${name}` : ""}`;
  doc.setTitle(clean(title, regular));
  doc.setAuthor(name || regNo || "ARICT GPA Calculator");
  doc.setSubject("GPA report exported from gpa.arict.lk (ARICT GPA Calculator)");
  doc.setKeywords(["ARICT", "GPA", "Rajarata University", "Faculty of Applied Sciences", dept.name]);
  doc.setCreator("ARICT GPA Calculator · gpa.arict.lk");
  doc.setProducer("ARICT GPA Calculator · gpa.arict.lk");
  doc.setCreationDate(now);
  doc.setModificationDate(now);

  const payload = JSON.stringify({
    app: APP_ID,
    format: 1,
    exportedAt: now.toISOString(),
    profile: { name, regNo },
    state: sanitize(state),
  });
  doc.getInfoDict().set(PDFName.of(DATA_KEY), PDFHexString.fromText(payload));
  await doc.attach(new TextEncoder().encode(payload), ATTACHMENT, {
    mimeType: "application/json",
    description: "ARICT GPA Calculator backup. Upload this PDF at gpa.arict.lk to restore your grades.",
    creationDate: now,
    modificationDate: now,
  });

  const bytes = await doc.save();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const filename = ["ARICT-GPA-Report", slug(dept.name), regNo && slug(regNo), stamp].filter(Boolean).join("-") + ".pdf";
  return { bytes, filename };
}

/** Reads the backup a report carries. Throws BackupError with a readable message if there is none. */
export async function readReportBackup(bytes) {
  const { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, PDFString, PDFHexString, decodePDFRawStream } = await import("pdf-lib");
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  } catch {
    throw new BackupError("That PDF couldn't be opened. Is the file complete?");
  }

  let json = null;
  try {
    const v = doc.getInfoDict().lookup(PDFName.of(DATA_KEY));
    if (v instanceof PDFHexString || v instanceof PDFString) json = v.decodeText();
  } catch {}

  if (!json) {
    try {
      const names = doc.catalog.lookupMaybe(PDFName.of("Names"), PDFDict);
      const files = names?.lookupMaybe(PDFName.of("EmbeddedFiles"), PDFDict);
      const arr = files?.lookupMaybe(PDFName.of("Names"), PDFArray);
      for (let i = 0; arr && i + 1 < arr.size(); i += 2) {
        const spec = arr.lookupMaybe(i + 1, PDFDict);
        const fname = spec?.lookupMaybe(PDFName.of("UF"), PDFString, PDFHexString) || spec?.lookupMaybe(PDFName.of("F"), PDFString, PDFHexString);
        if (fname?.decodeText() !== ATTACHMENT) continue;
        const stream = spec.lookupMaybe(PDFName.of("EF"), PDFDict)?.lookupMaybe(PDFName.of("F"), PDFRawStream);
        if (stream) json = new TextDecoder().decode(decodePDFRawStream(stream).decode());
        break;
      }
    } catch {}
  }

  if (!json) {
    throw new BackupError(
      "This PDF has no ARICT GPA data. Use a report downloaded from gpa.arict.lk, not a printed or re-saved copy.",
    );
  }
  let payload;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new BackupError("The backup inside this PDF is damaged.");
  }
  if (payload?.app !== APP_ID || !payload.state) throw new BackupError("This PDF wasn't exported by the ARICT GPA Calculator.");
  return { state: sanitize(payload.state), profile: payload.profile || null, exportedAt: payload.exportedAt || null };
}

export function downloadBytes(bytes, filename, type = "application/pdf") {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---- helpers ----

async function fetchBytes(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Couldn't load ${path}`);
  return new Uint8Array(await res.arrayBuffer());
}

function hexToRgb(rgb, hex) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function slug(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Standard PDF fonts only cover Latin (WinAnsi) characters; swap or drop anything else.
const encodable = new Map();
function clean(str, font) {
  const s = String(str ?? "")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/Σ/g, "Sum")
    .replace(/\s+/g, " ");
  let out = "";
  for (const ch of s) {
    let ok = encodable.get(ch);
    if (ok === undefined) {
      try {
        font.encodeText(ch);
        ok = true;
      } catch {
        ok = false;
      }
      encodable.set(ch, ok);
    }
    if (ok) out += ch;
  }
  return out;
}

/** Accepts a report PDF or an older JSON backup and returns { state, profile, exportedAt }. */
export async function readBackupFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // "%PDF"
  if (isPdf) return readReportBackup(bytes);
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return { state: sanitize(parsed), profile: null, exportedAt: parsed.exportedAt || null };
  } catch {
    throw new BackupError("That file isn't an ARICT GPA report or backup.");
  }
}
