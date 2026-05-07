import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chaindetective.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${BASE}/play`,          lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
{ url: `${BASE}/leaderboard`,   lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
  ];
}
