import { ArrowUpRight, Check, FileText, FileUp, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Calculator from "@/components/Calculator";
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
function HeroIntro() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] font-medium text-white/75 backdrop-blur">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          Faculty of Applied Sciences · Rajarata University of Sri Lanka
        </p>
        <h1 className="mt-6 font-display text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-white sm:text-6xl lg:text-[4.4rem]">
          Your GPA, <span className="text-brand">semester</span> by semester.
        </h1>
      </div>
      <div className="lg:pb-2">
        <p className="max-w-md text-[15.5px] leading-relaxed text-pretty text-white/65 sm:text-[17px]">
          Pick your department and every course loads with its credits and GPA weight. Add your grades to see your semester,
          cumulative and overall GPA.
        </p>
        <p className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55">
          <ShieldCheck className="size-4 text-good" aria-hidden />
          No sign-in. Your grades never leave this browser.
        </p>
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
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">PDF report &amp; backup</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
            A report you can share. A backup you can restore.
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
            Download your GPA as a designed PDF from the summary panel. The same file carries a copy of your grades, so uploading it brings them
            back on any device. It&rsquo;s all made in your browser; nothing is sent to a server.
          </p>
          <ul className="mt-8 grid gap-5">
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
            className="mt-8 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft"
          >
            <FileUp className="size-4" aria-hidden /> Restore from a PDF
          </a>
        </div>
        <ReportPreview />
      </div>
    </section>
  );
}

// A drawn miniature of the exported PDF. Paper stays white in both themes, like the real file.
function ReportPreview() {
  const bars = [62, 70, 66, 78, 84, 0, 0, 0];
  return (
    <div className="relative mx-auto w-full max-w-[25rem] lg:mr-0" aria-hidden>
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-brand/20 blur-3xl" />
      <div className="aspect-[1/1.414] rotate-[1.5deg] overflow-hidden rounded-xl bg-white text-[#0b0b0b] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/5">
        <div className="relative overflow-hidden bg-[#0b0b0b] px-[7%] pt-[6%] pb-[5%] text-white">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[#e5484d]" />
          <div className="absolute -top-16 -right-10 size-40 rounded-full bg-[#a00000]/50 blur-2xl" />
          <div className="relative flex items-start justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/arict-wordmark-light.png" alt="" className="h-3 w-auto" />
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
              ["REG. NO.", "2021/ICT/045"],
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

      <div className="absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-2.5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)] sm:-left-8">
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

function Grading() {
  const half = Math.ceil(GRADES.length / 2);
  return (
    <section id="grading" className="scroll-mt-24 border-t border-line bg-mist">
      <div className="container-page py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">How it&rsquo;s calculated</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">The faculty grading system</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Grade points, credits and class bands follow the Faculty of Applied Sciences Student Handbook 2022/23.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
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

        <p className="mt-8 text-[13px] text-muted">
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
        <div>
          <p className="font-mono text-xs font-medium tracking-wide text-brand uppercase">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
            Questions about GPA at RUSL
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            Quick answers on how the Faculty of Applied Sciences calculates GPA, and how this tool works.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
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
    <footer className="border-t border-line bg-paper">
      <div className="container-page flex flex-col gap-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arict-wordmark.png" alt="ARICT" className="h-4 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arict-wordmark-light.png" alt="ARICT" className="hidden h-4 w-auto dark:block" />
          <span>Association of Rajarata Information &amp; Communication Technology</span>
        </div>
        <nav className="flex gap-5" aria-label="ARICT">
          <a href="https://arict.lk" className="hover:text-ink">arict.lk</a>
          <a href="https://papers.arict.lk" className="hover:text-ink">Past Papers</a>
          <a href="https://arict.lk/contact" className="hover:text-ink">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
