import { PRODUCTS, ORDERS, USERS, COUPONS } from "@/lib/mock-data";
import type { Product, Order, AppUser, Coupon } from "@/types";

/**
 * Domain queries — currently backed by in-memory mock data so the app runs
 * before MySQL is provisioned. Each function has a clear shape so it can be
 * swapped for a Prisma query (see lib/db.ts) without touching call sites.
 */

export async function listProducts(opts: {
  category?: string;
  collection?: string;
  search?: string;
  sort?: "latest" | "popular" | "price-asc" | "price-desc";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  perPage?: number;
} = {}): Promise<{ products: Product[]; total: number; page: number; perPage: number }> {
  let items = PRODUCTS.slice();

  if (opts.category) items = items.filter((p) => p.category === opts.category);
  if (opts.collection) items = items.filter((p) => p.collection === opts.collection);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (typeof opts.minPrice === "number") items = items.filter((p) => p.price >= opts.minPrice!);
  if (typeof opts.maxPrice === "number") items = items.filter((p) => p.price <= opts.maxPrice!);
  if (opts.inStock) items = items.filter((p) => p.stock > 0);

  switch (opts.sort) {
    case "popular":
      items.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    default:
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const total = items.length;
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.max(1, opts.perPage ?? 12);
  const start = (page - 1) * perPage;

  return {
    products: items.slice(start, start + perPage),
    total,
    page,
    perPage,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.featured);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return PRODUCTS.slice()
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getSaleProducts(limit = 4): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.compareAt && p.compareAt > p.price)
    .sort((a, b) => {
      const da = (b.compareAt! - b.price) / b.compareAt!;
      const db = (a.compareAt! - a.price) / a.compareAt!;
      return da - db;
    })
    .slice(0, limit);
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const target = PRODUCTS.find((p) => p.slug === slug);
  if (!target) return [];
  return PRODUCTS.filter(
    (p) => p.category === target.category && p.slug !== slug
  ).slice(0, 4);
}

export async function listOrders(): Promise<Order[]> {
  return ORDERS.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listUsers(): Promise<AppUser[]> {
  return USERS.slice();
}

export async function listCoupons(): Promise<Coupon[]> {
  return COUPONS.slice();
}

export interface AdminStats {
  revenue: number;
  orders: number;
  customers: number;
  conversion: number;
  weekly: { day: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const revenue = ORDERS.reduce((a, o) => a + o.total, 0);
  return {
    revenue,
    orders: ORDERS.length + 18,
    customers: USERS.filter((u) => u.role === "customer").length + 124,
    conversion: 3.4,
    weekly: [
      { day: "Mon", revenue: 1820, orders: 6 },
      { day: "Tue", revenue: 2480, orders: 9 },
      { day: "Wed", revenue: 1920, orders: 7 },
      { day: "Thu", revenue: 3120, orders: 12 },
      { day: "Fri", revenue: 4180, orders: 17 },
      { day: "Sat", revenue: 5240, orders: 21 },
      { day: "Sun", revenue: 3320, orders: 11 },
    ],
    topProducts: [
      { name: "Florence Tote", sold: 132 },
      { name: "Atelier Backpack", sold: 87 },
      { name: "Courier Crossbody", sold: 64 },
      { name: "Milano Shoulder", sold: 41 },
      { name: "Soirée Clutch", sold: 28 },
    ],
  };
}
