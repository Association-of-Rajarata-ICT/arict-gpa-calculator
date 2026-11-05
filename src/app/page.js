import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Calculator from "@/components/Calculator";
import { CLASSES, GRADES } from "@/lib/gpa";

const HANDBOOK_URL = "https://aps.rjt.ac.lk/student-handbook-and-prospectus/";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Calculator intro={<HeroIntro />} />
        <Grading />
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
