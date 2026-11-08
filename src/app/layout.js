import { Instrument_Serif, Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DESCRIPTION, KEYWORDS, ORG, SHARE_DESCRIPTION, SHARE_TITLE, SITE_NAME, SITE_URL, TITLE } from "@/lib/site";
import BackToTop from "@/components/BackToTop";
import Header from "@/components/Header";
import SmoothScroll from "@/components/motion/SmoothScroll";
import PageMotion from "@/components/motion/PageMotion";
import PageTransition from "@/components/motion/PageTransition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · ARICT GPA" },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: ORG.name, url: ORG.url }],
  creator: ORG.name,
  publisher: ORG.longName,
  category: "education",
  alternates: { canonical: "/", languages: { "en-LK": "/" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { title: SHARE_TITLE, description: SHARE_DESCRIPTION, url: SITE_URL, siteName: SITE_NAME, type: "website", locale: "en_LK" },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, description: SHARE_DESCRIPTION },
  // Geographic hints for Sri Lankan, Anuradhapura-district (Mihintale) searches.
  other: { "geo.region": "LK-71", "geo.placename": "Mihintale, Anuradhapura, Sri Lanka", "geo.position": "8.35;80.51", ICBM: "8.35, 80.51" },
};

export const viewport = {
  themeColor: "#0a0a0b",
};

// Dark is the default for everyone, whatever their system setting; only choosing light with the toggle
// changes it. Applied before first paint so there is no flash,
// and marks whether motion is allowed so animated elements start hidden instead of flashing.
const themeScript = `(function(){try{var r=document.documentElement;r.classList.toggle("dark",localStorage.getItem("arict-theme")!=="light");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)r.classList.add("motion");}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en-LK" className={`dark ${inter.variable} ${manrope.variable} ${jetbrains.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh antialiased" suppressHydrationWarning>
        <Header />
        {children}
        <SmoothScroll />
        <PageMotion />
        <BackToTop />
        <PageTransition />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
