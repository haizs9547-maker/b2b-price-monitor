import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/data/seo-pages";
import { SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/directory", ...SEO_PAGES.map(({ slug }) => `/${slug}`)].map((path) => ({
    url: new URL(path, SITE_ORIGIN).href,
  }));
}
