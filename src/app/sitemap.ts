import type { MetadataRoute } from "next";

/**
 * Sitemap — keeps search engines aware of the single landing page.
 * Add new public routes here as the site grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://omega-nine-weld.vercel.app";
  const lastModified = new Date();

  return [
    {
      url: base + "/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
