import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileText, FileUp, GraduationCap, Layers, PencilLine, RotateCcw, ShieldCheck, Target, TrendingUp, UserRound, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import HeroStage from "@/components/HeroStage";
import ReportPreview3D from "@/components/motion/ReportPreview3D";
import { CLASSES, GRADES } from "@/lib/gpa";
import { FAQ } from "@/data/faq";
import { DESCRIPTION, ORG, SITE_NAME, SITE_URL } from "@/lib/site";

const HANDBOOK_URL = "https://aps.rjt.ac.lk/student-handbook-and-prospectus/";

// Structured data for search engines and AI answer engines. Kept in step with the visible page.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any (web browser)",
      browserRequirements: "Requires JavaScript",
      inLanguage: "en-LK",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "LKR" },
      featureList: [
        "Semester, cumulative and overall GPA",
        "Class band (First, Second Upper, Second Lower, Pass)",
        "All five Faculty of Applied Sciences departments",
        "PDF report with optional name and registration number",
        "Restore grades from an exported PDF",
        "Next-class planner: the GPA needed for First Class, Second Upper, Second Lower and Pass, with a target grade for every remaining course",
        "BSc (3 years) and BSc Honours (4 years)",
        "Grades stay in the browser, no sign-in",
      ],
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      areaServed: { "@type": "Country", name: "Sri Lanka" },
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: ORG.name,
      alternateName: ORG.longName,
      url: ORG.url,
      logo: ORG.logo,
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Rajarata University of Sri Lanka",
        address: { "@type": "PostalAddress", addressLocality: "Mihintale", addressRegion: "North Central Province", addressCountry: "LK" },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-LK",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <main id="main">
        <HeroStage anchorId="hero-preview">
          <HeroIntro />
          <HeroPreview />
        </HeroStage>
        <HowItWorks />
        <PlannerFeature />
        <ReportFeature />
        <Grading />
        <Faq />
      </main>
      <Footer cta />
    </>
  );
}

// Server-rendered intro for the hero stage; the calculator preview sits under it.
// Words are pre-split so GSAP can raise them one by one without touching the DOM structure.
function HeroIntro() {
  const words = [
    { w: "Your" },
    { w: "GPA," },
    { w: "semester", accent: true },
    { w: "by" },
    { w: "semester." },
  ];
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      <a
        href="#class-planner"
        data-hero="1"
        className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pr-3 pl-1 text-[12.5px] font-medium text-body shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)] backdrop-blur transition-colors hover:border-brand/50"
      >
        <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">NEW</span>
        Plan your path to the next class
        <ArrowRight className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
      </a>

      <h1
        data-hero="2"
        aria-label="Your GPA, semester by semester."
        className="mt-7 font-display text-[2.7rem] leading-[1.02] font-bold tracking-[-0.045em] text-ink sm:text-6xl lg:text-[5.2rem]"
      >
        {words.map(({ w, accent }, i) => (
          <span key={i} aria-hidden>
            <span className="split-word">
              <span className={`split-inner ${accent ? "font-serif font-normal tracking-[-0.02em] text-brand italic" : ""}`}>{w}</span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>

      <p data-hero="3" className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-pretty text-muted sm:text-[17.5px]">
        The GPA calculator for the Faculty of Applied Sciences, Rajarata University. Add your grades to see semester, cumulative and
        overall GPA, plan the grades you need for the next class, and keep everything in a PDF report.
      </p>

      <div data-hero="4" className="mt-9 flex flex-col items-center gap-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/calculator"
            data-magnetic
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink pr-2 pl-6 text-[14.5px] font-semibold text-paper shadow-[0_18px_40px_-18px_rgb(160_0_0/0.7)] transition-colors hover:bg-brand hover:text-white"
          >
            Calculate my GPA
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper/15 transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
          <a
            href="#grading"
            className="inline-flex h-12 items-center gap-1.5 rounded-full border border-line-strong bg-surface/60 px-6 text-[14.5px] font-semibold text-ink backdrop-blur transition-colors hover:border-ink/40"
          >
            How GPA is calculated
          </a>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-muted">
          <li className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-good" aria-hidden /> No sign-in
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Check className="size-4 text-good" aria-hidden /> Grades stay in your browser
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Check className="size-4 text-good" aria-hidden /> All five departments
          </li>
        </ul>
      </div>
    </div>
  );
}

// A drawn preview of the calculator, in the site's own theme. The whole frame links to the calculator page,
// and the hero's WebGL horizon rises behind it.
function HeroPreview() {
  const rows = [
    ["ICT 2204", "Web Technologies", "2", "A"],
    ["ICT 2301", "Design and Analysis of Algorithms", "3", "B+"],
    ["ICT 2402", "Software Engineering", "4", "A-"],
    ["ICT 2403", "Graphics and Image Processing", "4", "A"],
  ];
  const bars = [62, 70, 66, 78, 84, 80];
  return (
    <Link
      id="hero-preview"
      href="/calculator"
      data-hero="5"
      aria-label="Open the GPA calculator"
      className="group relative mx-auto mt-24 block max-w-5xl rounded-[28px] border border-line bg-surface/60 p-2 shadow-[0_50px_100px_-50px_rgb(0_0_0/0.55)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:mt-32 sm:p-2.5"
    >
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent" aria-hidden />
      <div className="overflow-hidden rounded-[22px] border border-line bg-paper">
        <div className="flex items-center gap-2 border-b border-line bg-mist px-4 py-3">
          <span className="size-2.5 rounded-full bg-brand" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="mx-auto inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1 font-mono text-[11px] text-muted">
            gpa.arict.lk<span className="text-ink">/calculator</span>
          </span>
          <span className="hidden w-12 sm:block" />
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-medium text-muted">BSc Honours in Information Technology</p>
                <p className="font-display text-xl font-bold tracking-tight text-ink">Computing</p>
              </div>
              <span className="inline-flex rounded-full border border-line bg-mist p-1 text-[11px] font-semibold text-muted">
                <span className="rounded-full px-2.5 py-1">Year 1</span>
                <span className="rounded-full bg-surface px-2.5 py-1 text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]">Year 2</span>
                <span className="rounded-full px-2.5 py-1">Year 3</span>
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center justify-between border-b border-line bg-mist px-4 py-3">
                <p className="font-display text-[14px] font-bold text-ink">Semester I</p>
                <p className="text-[12px] text-muted">
                  Semester GPA <b className="ml-1 font-display text-[15px] text-ink">3.77</b>
                </p>
              </div>
              <ul className="divide-y divide-line">
                {rows.map(([code, title, cr, g]) => (
                  <li key={code} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-16 shrink-0 font-mono text-[11.5px] font-semibold text-brand">{code}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{title}</span>
                    <span className="hidden text-[11.5px] text-muted sm:block">{cr} credits</span>
                    <span className="inline-flex h-8 w-16 items-center justify-center rounded-lg bg-ink font-display text-[13px] font-bold text-paper">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 self-start">
            <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0b] p-5 text-white dark:bg-surface dark:ring-1 dark:ring-white/10">
              <div className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full bg-[#a00000]/50 blur-3xl" />
              <p className="relative text-[10.5px] font-semibold tracking-[0.1em] text-white/55 uppercase">Overall GPA</p>
              <p className="relative mt-1.5 font-display text-5xl leading-none font-extrabold tracking-[-0.04em]">3.80</p>
              <div className="relative mt-4 h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[95%] rounded-full bg-[#e5484d]" />
              </div>
              <span className="relative mt-3 inline-flex h-6 items-center rounded-full bg-white px-2.5 text-[11px] font-bold text-[#0b0b0b]">First Class</span>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-[10.5px] font-semibold tracking-[0.1em] text-muted uppercase">By semester</p>
              <div className="mt-3 flex h-14 items-end gap-1.5">
                {bars.map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-[3px] bg-brand" style={{ height: `${h}%` }} />
                ))}
                <span className="h-1 flex-1 rounded-full bg-line" />
                <span className="h-1 flex-1 rounded-full bg-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute right-6 -bottom-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_-14px_rgb(229_72_77/0.9)] transition-transform group-hover:translate-x-0.5">
        Open the calculator <ArrowRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  );
}

// What the site does, in three steps.
function HowItWorks() {
  const steps = [
    { n: "01", icon: Layers, title: "Pick your department and degree", text: "All five departments of the Faculty of Applied Sciences. Choose BSc (3 years) or BSc Honours (4 years) and every course loads with its credits." },
    { n: "02", icon: PencilLine, title: "Enter your grades", text: "Choose a grade for each course you sat and leave the rest. Semester, cumulative and overall GPA update as you go, with your class." },
    { n: "03", icon: Target, title: "Plan the next class", text: "See the GPA you need for each class, a grade to aim for in every remaining course, and download it all as a PDF report." },
  ];
  return (
    <section id="how" className="scroll-mt-24 border-b border-line">
      <div className="container-page py-20">
        <div data-reveal className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">From grades to a plan, in three steps</h2>
        </div>

        {/* EIS Auto-Fill shortcut banner */}
        <div data-reveal className="mt-10">
          <Link
            href="/calculator"
            className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-r from-brand/[0.09] via-surface/90 to-surface p-6 shadow-[0_0_0_1px_rgb(229_72_77/0.06)] transition-all hover:border-brand/60 hover:shadow-[0_16px_40px_-20px_rgb(229_72_77/0.25)] sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:from-brand/[0.14] dark:via-[#111114]/95 dark:to-[#0e0e10]/95"
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" aria-hidden />
            <div className="flex items-start gap-4 sm:items-center">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_8px_20px_-8px_rgb(229_72_77/0.6)]">
                <Zap className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[17px] font-bold tracking-tight text-ink">
                    Or skip steps 1 & 2 — Auto-Fill from EiS
                  </h3>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">New</span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">
                  Log in with your Rajarata University EIS credentials and every enrolled semester, course, and grade loads in seconds. No typing, no searching.
                </p>
              </div>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full border border-brand/50 bg-brand/10 px-4 text-[13px] font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white sm:self-center">
              Try it <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </div>

        <ol data-reveal-stagger className="mt-5 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <s.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="font-mono text-xs font-medium text-muted">{s.n}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/calculator"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white"
          >
            Open the calculator <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <p className="text-[13px] text-muted">Biological · Chemical · Computing · Health Promotion · Physical Sciences</p>
        </div>
      </div>
    </section>
  );
}

function PlannerFeature() {
  const steps = [
    {
      icon: GraduationCap,
      title: "Choose BSc or BSc Honours",
      text: "Three years or four. It decides which years count toward your GPA, and Year 4 is marked Honours only for a BSc.",
    },
    {
      icon: Target,
      title: "See what each class needs",
      text: "For First Class, Second Upper, Second Lower and Pass: the average your remaining courses need, or whether it's already secured or out of reach.",
    },
    {
      icon: TrendingUp,
      title: "A grade to aim for in every course",
      text: "The planner suggests a grade for each remaining course, a step higher where the credits are biggest. Change any of them and watch your projected final GPA move.",
    },
  ];
  return (
    <section id="class-planner" className="relative isolate scroll-mt-24 overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute top-1/2 -right-40 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" aria-hidden />
      <div className="container-page grid gap-14 py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <PlannerPreview />
        <div className="lg:order-first">
          <p data-reveal className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-wide text-brand uppercase">
            <span className="rounded-full bg-brand px-2 py-0.5 font-sans text-[10.5px] font-bold tracking-wide text-white">NEW</span>
            Next-class planner
          </p>
          <h2 data-reveal className="mt-3 max-w-lg font-display text-3xl font-bold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
            Know exactly what it takes to reach the{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-brand italic">next class.</span>
          </h2>
          <p data-reveal className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
            On a Pass and aiming for Second Lower? On Second Lower and want Second Upper? Enter the grades you have, and the planner works
            out the GPA you need from here, for every department in the faculty.
          </p>
          <ol data-reveal-stagger className="mt-8 grid gap-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <s.icon className="size-[18px]" aria-hidden />
                  <span className="absolute -top-1.5 -right-1.5 inline-flex size-4.5 items-center justify-center rounded-full bg-ink font-mono text-[9.5px] font-bold text-paper">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-display text-[15.5px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/calculator"
            data-reveal
            data-magnetic
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-16px_rgb(229_72_77/0.8)] transition-colors hover:bg-brand-dark"
          >
            <Target className="size-4" aria-hidden /> Plan my class
          </Link>
        </div>
      </div>
    </section>
  );
}

// A drawn miniature of the planner, in the site's own theme.
function PlannerPreview() {
  const ladder = [
    { name: "First Class", from: "3.70", need: "Out of reach", sub: "Highest possible 3.53", tone: "off" },
    { name: "Second Upper", from: "3.30", need: "Average 3.39", sub: "About B+ to A-", tone: "goal" },
    { name: "Second Lower", from: "3.00", need: "Average 2.62", sub: "You are here", tone: "here" },
    { name: "Pass", from: "2.00", need: "Secured", sub: "C or better keeps it", tone: "ok" },
  ];
  const rows = [
    ["ICT 3209", "Principles of Accounting", "2 cr", "B+"],
    ["ICT 3301", "Human Computer Interaction", "3 cr", "A-"],
    ["ICT 3411", "Group Project", "4 cr", "A-"],
    ["IDC 3201", "Entrepreneurship Development", "2 cr", "B+"],
  ];
  return (
    <div data-reveal className="relative mx-auto w-full max-w-[34rem]" aria-hidden>
      <div className="absolute inset-8 -z-10 rounded-[2rem] bg-brand/20 blur-3xl" />
      <div className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[10px] font-medium tracking-wide text-brand uppercase">Next-class planner</p>
            <p className="mt-0.5 font-display text-[17px] font-bold tracking-tight text-ink">Your path to Second Upper</p>
          </div>
          <span className="rounded-xl border border-line bg-mist px-2.5 py-1.5 text-[11px] font-bold text-ink">BSc Honours · 4y</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {ladder.map((l) => (
            <div key={l.name} className={`p-3.5 ${l.tone === "goal" ? "bg-ink text-paper" : "bg-surface"} ${l.tone === "off" ? "opacity-55" : ""}`}>
              <p className={`font-mono text-[9.5px] ${l.tone === "goal" ? "text-paper/60" : "text-muted"}`}>from {l.from}</p>
              <p className="mt-1 font-display text-[13px] leading-tight font-bold">{l.name}</p>
              <p className={`mt-1 text-[11.5px] font-semibold ${l.tone === "ok" ? "text-good" : ""}`}>{l.need}</p>
              <p className={`text-[10.5px] ${l.tone === "goal" ? "text-paper/60" : l.tone === "here" ? "font-semibold text-brand" : "text-muted"}`}>{l.sub}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[9.5rem_1fr]">
          <div className="rounded-2xl bg-ink p-3.5 text-paper">
            <p className="text-[9.5px] font-semibold tracking-[0.1em] text-paper/55 uppercase">With these grades</p>
            <p className="mt-1 font-display text-[30px] leading-none font-extrabold tracking-tight">3.31</p>
            <p className="mt-1 text-[10.5px] text-paper/65">Second Class (Upper)</p>
            <div className="relative mt-2.5 h-1.5 rounded-full bg-paper/15">
              <div className="h-full w-[83%] rounded-full bg-[#e5484d]" />
              <span className="absolute -top-1 left-[82.5%] h-3.5 w-0.5 rounded-full bg-paper" />
            </div>
            <p className="mt-2.5 text-[10.5px] font-semibold text-paper/85">On track</p>
          </div>
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {rows.map(([code, title, cr, g]) => (
              <li key={code} className="flex items-center gap-2.5 px-3 py-2">
                <span className="w-14 shrink-0 font-mono text-[10.5px] font-semibold text-brand">{code}</span>
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink">{title}</span>
                <span className="text-[10.5px] text-muted">{cr}</span>
                <span className="rounded-lg border border-dashed border-line-strong px-2 py-0.5 font-display text-[11.5px] font-bold text-ink">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReportFeature() {
  const points = [
    {
      icon: FileText,
      title: "Everything in one PDF",
      text: "Overall GPA and class band, a semester chart, semester and cumulative GPA, and every graded course with its credits and points.",
    },
    {
      icon: UserRound,
      title: "Your name, only if you want it",
      text: "When you export, add your name or registration number to print them on the report. Or skip, and it downloads straight away.",
    },
    {
      icon: RotateCcw,
      title: "It's also your backup",
      text: "Cleared your browser or changed phones? Choose Restore from PDF, pick the report, and every grade fills back in.",
    },
  ];
  return (
    <section id="report" className="scroll-mt-24 border-t border-line">
      <div className="container-page grid gap-14 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
        <div>
          <p data-reveal className="font-mono text-xs font-medium tracking-wide text-brand uppercase">PDF report &amp; backup</p>
          <h2 data-reveal className="mt-3 max-w-lg font-display text-3xl font-bold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
            A report you can share. A backup you can restore.
          </h2>
          <p data-reveal className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
            Download your GPA as a designed PDF from the summary panel. The same file carries a copy of your grades, so uploading it brings them
            back on any device. It&rsquo;s all made in your browser; nothing is sent to a server.
          </p>
          <ul data-reveal-stagger className="mt-8 grid gap-5">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <p.icon className="size-[18px]" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-[15.5px] font-bold text-ink">{p.title}</h3>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/calculator#departments"
            data-reveal
            className="mt-8 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft"
          >
            <FileUp className="size-4" aria-hidden /> Restore from a PDF
          </Link>
        </div>
        <div data-reveal className="w-full">
          <div data-parallax="0.06">
            <ReportPreview3D />
          </div>
        </div>
      </div>
    </section>
  );
}

function Grading() {
  const half = Math.ceil(GRADES.length / 2);
  return (
    <section id="grading" className="scroll-mt-24 border-t border-line bg-mist">
      <div className="container-page py-20">
        <div data-reveal className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">How it&rsquo;s calculated</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">The faculty grading system</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Grade points, credits and class bands follow the Faculty of Applied Sciences Student Handbook 2022/23.
          </p>
        </div>

        <div data-reveal-stagger className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="font-display text-base font-bold text-ink">Grade points</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-6">
              {[GRADES.slice(0, half), GRADES.slice(half)].map((col, i) => (
                <dl key={i} className="divide-y divide-line">
                  {col.map((g) => (
                    <div key={g.grade} className="flex items-center justify-between py-2">
                      <dt className="font-display text-[15px] font-bold text-ink">{g.grade}</dt>
                      <dd className="font-mono text-sm text-muted tabular-nums">{g.points.toFixed(1)}</dd>
                    </div>
                  ))}
                </dl>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="font-display text-base font-bold text-ink">The formula</h3>
            <div className="mt-4 rounded-2xl bg-mist px-4 py-5 text-center font-display text-ink">
              <div className="text-[15px] font-semibold">Σ (grade point × credits)</div>
              <div className="mx-auto my-2 h-px w-4/5 bg-ink/70" />
              <div className="text-[15px] font-semibold">Σ credits</div>
            </div>
            <ul className="mt-4 grid gap-2.5 text-[13.5px] leading-relaxed text-body">
              <li>
                <b className="text-ink">Credits</b> are the second digit of the course code: ICT 1<b className="text-brand">4</b>07 is a
                4-credit course.
              </li>
              <li>
                <b className="text-ink">Non-GPA:</b> foundation courses (FDN) and IDC 1202 Career Development carry zero credits and are
                not counted.
              </li>
              <li>
                <b className="text-ink">Truncated,</b> not rounded, to two decimals, as the handbook does.
              </li>
              <li>
                <b className="text-ink">Credit is earned with C or better.</b> A grade below C (an E included) still counts in the GPA but earns
                no credit. You may re-sit, and the best grade on a re-sit is C.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="font-display text-base font-bold text-ink">Class bands</h3>
            <ul className="mt-4 divide-y divide-line">
              {CLASSES.map((c) => (
                <li key={c.label} className="flex items-center justify-between py-2.5">
                  <span className="text-[14px] font-medium text-ink">{c.label}</span>
                  <span className="font-mono text-sm text-muted tabular-nums">≥ {c.min.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
              Your final GPA uses your best 90 credits (BSc) or 120 credits (BSc Honours), including all compulsory courses. Classes
              also need minimum grades and credits within set years. Read the handbook for the full rules.
            </p>
          </div>
        </div>

        <p data-reveal className="mt-8 text-[13px] text-muted">
          This is an unofficial calculator. Your official results are on the EIS.{" "}
          <a href={HANDBOOK_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 font-semibold text-ink underline-offset-4 hover:text-brand hover:underline">
            Student handbooks <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line">
      <div className="container-page grid gap-10 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
            Questions about GPA at RUSL
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            Quick answers on how the Faculty of Applied Sciences calculates GPA, and how this tool works.
          </p>
        </div>
        <div data-reveal-stagger className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-[16px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="mt-1 text-brand transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
