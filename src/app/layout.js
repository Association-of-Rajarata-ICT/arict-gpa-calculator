import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { DESCRIPTION, KEYWORDS, ORG, SHARE_DESCRIPTION, SHARE_TITLE, SITE_NAME, SITE_URL, TITLE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

// Applies the saved (or system) theme before first paint so there is no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem("arict-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en-LK" className={`${inter.variable} ${manrope.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
