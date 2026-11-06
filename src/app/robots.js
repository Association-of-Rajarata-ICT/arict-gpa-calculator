import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// Search engines and AI answer engines are welcome: the site is public and has no private pages.
export default function robots() {
  const ai = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"];
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...ai.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
