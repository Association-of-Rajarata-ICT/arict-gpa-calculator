import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, FileUp, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Calculator from "@/components/Calculator";
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
      <Header />
      <main>
        <Calculator intro={<HeroIntro />} />
        <ReportFeature />
        <Grading />
        <Faq />
      </main>
      <Footer />
    </>
  );
}

// Server-rendered intro for the hero stage; Calculator places the department picker under it.
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
        href="#report"
        data-hero="1"
        className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pr-3 pl-1 text-[12.5px] font-medium text-body shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)] backdrop-blur transition-colors hover:border-brand/50"
      >
        <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">NEW</span>
        PDF reports that restore your grades
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
        The GPA calculator for the Faculty of Applied Sciences, Rajarata University. Pick your department, add your grades, and see
        semester, cumulative and overall GPA with your class band.
      </p>

      <div data-hero="4" className="mt-9 flex flex-col items-center gap-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#departments"
            data-magnetic
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink pr-2 pl-6 text-[14.5px] font-semibold text-paper shadow-[0_18px_40px_-18px_rgb(160_0_0/0.7)] transition-colors hover:bg-brand hover:text-white"
          >
            Calculate my GPA
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper/15 transition-transform group-hover:translate-y-0.5">
              <ArrowDown className="size-4" aria-hidden />
            </span>
          </a>
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
          <a
            href="#departments"
            data-reveal
            className="mt-8 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft"
          >
            <FileUp className="size-4" aria-hidden /> Restore from a PDF
          </a>
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

function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-paper">
      <div className="pointer-events-none absolute bottom-[-18rem] left-1/2 -z-10 h-[26rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" aria-hidden />

      <div className="container-page py-20 text-center sm:py-28">
        <p data-reveal className="font-mono text-xs font-medium tracking-wide text-brand uppercase">Ready when you are</p>
        <h2 data-reveal className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold tracking-[-0.04em] text-balance text-ink sm:text-6xl">
          Check your GPA in <span className="font-serif font-normal tracking-[-0.02em] text-brand italic">under a minute.</span>
        </h2>
        <div data-reveal className="mt-9 flex justify-center">
          <a
            href="#departments"
            data-magnetic
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink pr-2 pl-6 text-[14.5px] font-semibold text-paper transition-colors hover:bg-brand hover:text-white"
          >
            Start calculating
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper/15 transition-transform group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </a>
        </div>
      </div>

      <div className="container-page">
        <div className="flex flex-col gap-4 border-t border-line py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark.png" alt="ARICT" className="h-4 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="hidden h-4 w-auto dark:block" />
            <span>Association of Rajarata Information &amp; Communication Technology</span>
          </div>
          <nav className="flex gap-5" aria-label="ARICT">
            <a href="https://arict.lk" className="transition-colors hover:text-ink">arict.lk</a>
            <a href="https://papers.arict.lk" className="transition-colors hover:text-ink">Past Papers</a>
            <a href="https://arict.lk/contact" className="transition-colors hover:text-ink">Contact</a>
          </nav>
        </div>
      </div>

      {/* Oversized wordmark, cut off by the page edge. */}
      <p
        className="pointer-events-none -mb-[0.2em] bg-gradient-to-b from-ink/[0.07] to-transparent bg-clip-text text-center font-display text-[19vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-transparent select-none"
        aria-hidden
      >
        ARICT
      </p>
    </footer>
  );
}
