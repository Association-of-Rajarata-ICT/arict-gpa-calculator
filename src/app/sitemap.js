import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/calculator`, lastModified, changeFrequency: "monthly", priority: 0.9 },
  ];
}
