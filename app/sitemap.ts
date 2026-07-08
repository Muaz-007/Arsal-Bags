import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

// Serve fresh on request. Prerendering during build hits the DB, which
// isn't guaranteed reachable from Vercel's build environment — Neon
// endpoints in particular can be paused/cold. Dynamic rendering keeps
// the build reliable and the sitemap current.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await listProducts({ perPage: 1000 }).catch(() => ({
    products: [] as Awaited<ReturnType<typeof listProducts>>["products"],
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/about",
    "/help/shipping",
    "/help/care",
    "/help/faq",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
