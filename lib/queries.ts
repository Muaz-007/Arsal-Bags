import { prisma } from "@/lib/db";
import {
  PRODUCTS,
  ORDERS,
  USERS,
  COUPONS,
} from "@/lib/mock-data";
import type {
  Product,
  Order,
  AppUser,
  Coupon,
  Category,
  OrderStatus,
} from "@/types";

/**
 * Domain queries — Prisma-backed when DATABASE_URL is set, mock-backed
 * otherwise. Each function has a stable shape so call sites (server
 * components + API routes) don't have to know which mode is active.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

const D = (v: unknown): number =>
  typeof v === "number" ? v : v === null || v === undefined ? 0 : Number(v);

function mapDbProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: D(p.price),
    compareAt: p.compareAt != null ? D(p.compareAt) : undefined,
    currency: "PKR",
    category: p.category as Category,
    collection: p.collection ?? undefined,
    colors: Array.isArray(p.colors) ? p.colors : [],
    materials: Array.isArray(p.materials) ? p.materials : [],
    images: Array.isArray(p.images) ? p.images : [],
    specifications: Array.isArray(p.specifications)
      ? p.specifications.filter(
          (s: any) =>
            s && typeof s.label === "string" && typeof s.value === "string"
        )
      : undefined,
    stock: p.stock,
    featured: !!p.featured,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    createdAt: (p.createdAt instanceof Date
      ? p.createdAt.toISOString()
      : String(p.createdAt)),
  };
}

function mapDbOrder(o: any): Order {
  return {
    id: o.id,
    userId: o.userId ?? "",
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone ?? null,
    items: (o.items ?? []).map((i: any) => ({
      productId: i.productId,
      slug: i.product?.slug ?? "",
      name: i.name,
      image: i.image,
      price: D(i.price),
      quantity: i.quantity,
      color: i.color ?? undefined,
    })),
    subtotal: D(o.subtotal),
    shipping: D(o.shipping),
    tax: D(o.tax),
    total: D(o.total),
    status: o.status as OrderStatus,
    paymentMethod: (o.paymentMethod ?? "cod") as "cod" | "card",
    trackingNumber: o.trackingNumber ?? null,
    trackingUrl: o.trackingUrl ?? null,
    cancellationReason: o.cancellationReason ?? null,
    createdAt:
      o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  };
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

export async function listProducts(
  opts: {
    category?: string;
    collection?: string;
    search?: string;
    sort?: "latest" | "popular" | "price-asc" | "price-desc";
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    saleOnly?: boolean;
    page?: number;
    perPage?: number;
  } = {}
): Promise<{ products: Product[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.max(1, opts.perPage ?? 12);

  if (prisma) {
    const where: any = {};
    if (opts.category) where.category = opts.category;
    if (opts.collection) where.collection = opts.collection;
    if (opts.inStock) where.stock = { gt: 0 };
    if (opts.saleOnly) where.compareAt = { not: null };
    if (opts.search) {
      // Postgres text `contains` is case-sensitive by default — insensitive
      // mode lets "Tote" match "tote", "TOTE", etc.
      where.OR = [
        { name: { contains: opts.search, mode: "insensitive" } },
        { tagline: { contains: opts.search, mode: "insensitive" } },
        { description: { contains: opts.search, mode: "insensitive" } },
      ];
    }
    if (opts.minPrice != null || opts.maxPrice != null) {
      where.price = {};
      if (opts.minPrice != null) where.price.gte = opts.minPrice;
      if (opts.maxPrice != null) where.price.lte = opts.maxPrice;
    }

    const orderBy =
      opts.sort === "popular"
        ? { reviewCount: "desc" as const }
        : opts.sort === "price-asc"
          ? { price: "asc" as const }
          : opts.sort === "price-desc"
            ? { price: "desc" as const }
            : { createdAt: "desc" as const };

    return tolerant(
      async () => {
        // For sale, fetch a wider window then post-filter on `compareAt > price`
        // (Postgres can't easily express a row-level column compare via Prisma
        // without raw SQL).
        if (opts.saleOnly) {
          const candidates = await prisma!.product.findMany({
            where,
            orderBy,
            take: 200,
          });
          const filtered = candidates
            .map(mapDbProduct)
            .filter((p) => p.compareAt && p.compareAt > p.price);
          const total = filtered.length;
          return {
            products: filtered.slice((page - 1) * perPage, page * perPage),
            total,
            page,
            perPage,
          };
        }

        const [items, total] = await Promise.all([
          prisma!.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * perPage,
            take: perPage,
          }),
          prisma!.product.count({ where }),
        ]);

        return {
          products: items.map(mapDbProduct),
          total,
          page,
          perPage,
        };
      },
      { products: [], total: 0, page, perPage }
    );
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────
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
  if (opts.saleOnly) items = items.filter((p) => p.compareAt && p.compareAt > p.price);

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
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return {
    products: items.slice((page - 1) * perPage, (page - 1) * perPage + perPage),
    total: items.length,
    page,
    perPage,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (prisma) {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          // Public PDP only shows approved reviews — pending / rejected
          // sit in the admin queue until moderated.
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });
    if (!p) return null;
    const product = mapDbProduct(p);
    // Batch-fetch the set of users who have ever bought *this* product so
    // we can mark their reviews as "Verified buyer" without an N+1.
    const reviewerIds = ((p as any).reviews ?? [])
      .map((r: any) => r.userId)
      .filter(Boolean);
    let verifiedIds = new Set<string>();
    if (reviewerIds.length > 0) {
      const orders = await prisma.order.findMany({
        where: {
          userId: { in: reviewerIds },
          items: { some: { productId: p.id } },
          status: { in: ["paid", "fulfilled", "shipped", "delivered"] },
        },
        select: { userId: true },
      });
      verifiedIds = new Set(orders.map((o) => o.userId).filter(Boolean) as string[]);
    }

    product.reviews = (p as any).reviews?.map((r: any) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      title: r.title,
      body: r.body,
      images: Array.isArray(r.images) ? r.images : [],
      userId: r.userId,
      verified: verifiedIds.has(r.userId),
      createdAt: r.createdAt.toISOString(),
    }));
    return product;
  }
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (prisma) {
    const p = await prisma.product.findUnique({ where: { id } });
    return p ? mapDbProduct(p) : null;
  }
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

/**
 * Run a Prisma query, falling back to an empty list / null if the
 * database is briefly unreachable (Neon auto-suspend cold start, transient
 * network blip, etc.). Better to render an empty section than to 500 the
 * whole homepage for one transient failure.
 */
async function tolerant<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[queries] DB query failed, returning fallback:", err);
    return fallback;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (prisma) {
    return tolerant(async () => {
      const rows = await prisma!.product.findMany({
        where: { featured: true },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapDbProduct);
    }, []);
  }
  return PRODUCTS.filter((p) => p.featured);
}

export async function getBestSellers(limit = 10): Promise<Product[]> {
  if (prisma) {
    return tolerant(async () => {
      const rows = await prisma!.product.findMany({
        orderBy: { reviewCount: "desc" },
        take: limit,
      });
      return rows.map(mapDbProduct);
    }, []);
  }
  return PRODUCTS.slice()
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getSaleProducts(limit = 10): Promise<Product[]> {
  if (prisma) {
    return tolerant(async () => {
      // Prisma can't easily express a `compareAt > price` row-level filter
      // without raw SQL, so we fetch the candidates and post-filter.
      const rows = await prisma!.product.findMany({
        where: { compareAt: { not: null } },
        take: 80,
      });
      return rows
        .map(mapDbProduct)
        .filter((p) => p.compareAt && p.compareAt > p.price)
        .sort((a, b) => {
          const da = (b.compareAt! - b.price) / b.compareAt!;
          const db = (a.compareAt! - a.price) / a.compareAt!;
          return da - db;
        })
        .slice(0, limit);
    }, []);
  }
  return PRODUCTS.filter((p) => p.compareAt && p.compareAt > p.price)
    .sort((a, b) => {
      const da = (b.compareAt! - b.price) / b.compareAt!;
      const db = (a.compareAt! - a.price) / a.compareAt!;
      return da - db;
    })
    .slice(0, limit);
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  if (prisma) {
    const target = await prisma.product.findUnique({ where: { slug } });
    if (!target) return [];
    const rows = await prisma.product.findMany({
      where: { category: target.category, NOT: { slug } },
      take: 4,
      orderBy: { reviewCount: "desc" },
    });
    return rows.map(mapDbProduct);
  }
  const target = PRODUCTS.find((p) => p.slug === slug);
  if (!target) return [];
  return PRODUCTS.filter(
    (p) => p.category === target.category && p.slug !== slug
  ).slice(0, 4);
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function listOrders(): Promise<Order[]> {
  if (prisma) {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
    return rows.map(mapDbOrder);
  }
  return ORDERS.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  if (prisma) {
    const rows = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
    return rows.map(mapDbOrder);
  }
  return ORDERS.filter((o) => o.userId === userId);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (prisma) {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
    return o ? mapDbOrder(o) : null;
  }
  return ORDERS.find((o) => o.id === id) ?? null;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<AppUser[]> {
  if (prisma) {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as "customer" | "admin",
      createdAt: u.createdAt.toISOString(),
      ordersCount: u._count.orders,
    }));
  }
  return USERS.slice();
}

// ─── Wishlist ───────────────────────────────────────────────────────────────

export async function listWishlistProducts(userId: string): Promise<Product[]> {
  if (prisma) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
    return items.map((i) => mapDbProduct(i.product));
  }
  return [];
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export async function listCoupons(): Promise<Coupon[]> {
  if (prisma) {
    const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((c) => ({
      code: c.code,
      type: c.type as "percent" | "fixed",
      value: D(c.value),
      active: c.active,
      expiresAt: c.expiresAt?.toISOString(),
      maxUses: c.maxUses ?? null,
      uses: c.uses,
    }));
  }
  return COUPONS.slice();
}

// ─── Reviews (admin) ────────────────────────────────────────────────────────

export type AdminReviewRow = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  approved: boolean;
  featured: boolean;
  createdAt: string;
};

export async function listAllReviews(): Promise<AdminReviewRow[]> {
  if (!prisma) return [];
  const rows = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      product: { select: { name: true, slug: true, images: true } },
    },
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.product?.name ?? "(deleted product)",
    productSlug: r.product?.slug ?? "",
    productImage:
      Array.isArray(r.product?.images) && r.product!.images.length > 0
        ? String((r.product!.images as unknown[])[0])
        : "",
    author: r.author,
    rating: r.rating,
    title: r.title,
    body: r.body,
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    approved: r.approved,
    featured: r.featured,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Homepage testimonials source. Returns admin-featured (and approved)
 * reviews with product info so the section can link out to the PDP.
 * Ordered newest-first; capped at 6 so a runaway feature list never
 * turns the section into a scrollable wall.
 */
export type HomepageReview = {
  id: string;
  productSlug: string;
  productName: string;
  author: string;
  role: string; // repurposed from review title
  quote: string;
  rating: number;
};

export async function getFeaturedReviews(): Promise<HomepageReview[]> {
  if (!prisma) return [];
  return tolerant(async () => {
    const rows = await prisma!.review.findMany({
      where: { approved: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { product: { select: { name: true, slug: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      productSlug: r.product?.slug ?? "",
      productName: r.product?.name ?? "",
      author: r.author,
      role: r.title,
      quote: r.body,
      rating: r.rating,
    }));
  }, []);
}

// ─── Newsletter subscribers ─────────────────────────────────────────────────

export type SubscriberRow = {
  email: string;
  source: string | null;
  active: boolean;
  createdAt: string;
};

export async function listSubscribers(): Promise<SubscriberRow[]> {
  if (!prisma) return [];
  const rows = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return rows.map((s) => ({
    email: s.email,
    source: s.source,
    active: s.active,
    createdAt: s.createdAt.toISOString(),
  }));
}

// ─── Storefront config ─────────────────────────────────────────────────────

type StorefrontKey = "hero" | "strip" | "featured" | "bestsellers" | "sale";

/**
 * Read an admin-curated section value out of `StorefrontConfig`. Returns
 * `null` when the key is unset OR when the DB isn't reachable, so callers
 * can fall back to their hardcoded defaults gracefully.
 */
export async function getStorefrontConfig<T = unknown>(
  key: StorefrontKey
): Promise<T | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.storefrontConfig.findUnique({ where: { key } });
    return (row?.value as T) ?? null;
  } catch {
    return null;
  }
}

/** Resolve a list of product IDs stored in StorefrontConfig into real Products. */
export async function resolveProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (prisma) {
    return tolerant(async () => {
      const rows = await prisma!.product.findMany({
        where: { id: { in: ids } },
      });
      // Preserve the admin-curated order.
      const byId = new Map(rows.map((r) => [r.id, mapDbProduct(r)]));
      return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
    }, []);
  }
  return PRODUCTS.filter((p) => ids.includes(p.id));
}

// ─── Admin stats ────────────────────────────────────────────────────────────

export interface AdminStats {
  revenue: number;
  orders: number;
  customers: number;
  conversion: number;
  weekly: { day: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  if (prisma) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentOrders, customers, topItems] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { total: true, createdAt: true },
      }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const revenue = recentOrders.reduce((a, o) => a + D(o.total), 0);

    // Bucket by day for the weekly chart
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly = days.map((d) => ({ day: d, revenue: 0, orders: 0 }));
    for (const o of recentOrders) {
      const idx = new Date(o.createdAt).getDay();
      weekly[idx].revenue += D(o.total);
      weekly[idx].orders += 1;
    }
    // Reorder Mon-Sun
    const ordered = [...weekly.slice(1), weekly[0]];

    return {
      revenue,
      orders: recentOrders.length,
      customers,
      conversion: 3.4,
      weekly: ordered,
      topProducts: topItems.map((t) => ({
        name: t.name,
        sold: t._sum.quantity ?? 0,
      })),
    };
  }

  // Mock mode
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
