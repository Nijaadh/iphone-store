import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { listProductsForSitemap } from "@/lib/products";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cached so search-engine crawlers do not hit the database on every visit.
  "use cache";
  cacheLife("hours");

  const base = siteUrl();
  const products = await listProductsForSitemap();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shop?condition=new`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/shop?condition=used`, changeFrequency: "daily", priority: 0.7 },
    ...products.map((p) => ({
      url: `${base}/phones/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
