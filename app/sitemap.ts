import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/queries";

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await listProducts({ perPage: 1000 });

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
