import type { MetadataRoute } from "next";

/**
 * Robots — allow all good-faith crawlers, point them at the sitemap.
 * Block nothing (the landing page is fully public; auth lives on the chat app).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://omega-nine-weld.vercel.app/sitemap.xml",
    host: "https://omega-nine-weld.vercel.app",
  };
}
