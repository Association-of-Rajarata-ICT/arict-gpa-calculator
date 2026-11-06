import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Calculator from "@/components/Calculator";
import Footer from "@/components/Footer";
import { SHARE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "GPA Calculator and Next-Class Planner";
const DESCRIPTION =
  "Pick your Faculty of Applied Sciences department, choose BSc or BSc Honours, enter your grades and see semester, cumulative and overall GPA. The planner shows the GPA you need for the next class and a grade to aim for in every remaining course.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/calculator" },
  // A page that sets its own openGraph replaces the layout's, so the image is named here again.
  openGraph: {
    title: `${SITE_NAME}: ${TITLE}`,
    description: SHARE_DESCRIPTION,
    url: `${SITE_URL}/calculator`,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_LK",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME}: ${TITLE}`, description: SHARE_DESCRIPTION, images: ["/opengraph-image.png"] },
};

export default function CalculatorPage() {
  return (
    <>
      <main id="main">
        <Calculator intro={<CalculatorIntro />} />
        <section className="border-t border-line">
          <div className="container-page flex flex-col gap-3 py-8 text-[13.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Unofficial. Grades, credits and class bands follow the Faculty of Applied Sciences Student Handbook 2022/23. Your official
              results are on the EIS.
            </p>
            <Link href="/#grading" className="font-semibold text-ink underline-offset-4 hover:text-brand hover:underline">
              How GPA is calculated
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// A short intro for the calculator hero; the department picker sits under it.
function CalculatorIntro() {
  const words = ["Calculate", "your", "GPA"];
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <p
        data-hero="1"
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-[12.5px] font-medium text-body backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-brand" aria-hidden />
        Faculty of Applied Sciences · Rajarata University of Sri Lanka
      </p>
      <h1
        data-hero="2"
        aria-label="Calculate your GPA"
        className="mt-6 font-display text-[2.6rem] leading-[1.02] font-bold tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.4rem]"
      >
        {words.map((w, i) => (
          <span key={w} aria-hidden>
            <span className="split-word">
              <span className={`split-inner ${i === words.length - 1 ? "font-serif font-normal tracking-[-0.02em] text-brand italic" : ""}`}>{w}</span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>
      <p data-hero="3" className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-pretty text-muted sm:text-[17px]">
        Choose your department, then your degree, then add your grades. Your GPA, class and plan for the next class update as you go.
      </p>
      <p data-hero="4" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted">
        <ShieldCheck className="size-4 text-good" aria-hidden />
        No sign-in. Your grades never leave this browser.
      </p>
    </div>
  );
}
