import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stutterlab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/stuttering-treatment`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/stuttering-therapy-app`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-stuttering-therapy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/speech-therapy-for-stuttering`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/stuttering-exercises`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
