import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stutterlab.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/settings/", "/exercises/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
