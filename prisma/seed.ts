/**
 * Prisma seed script.
 *
 * Run with: `npm run db:seed` once DATABASE_URL is set.
 * This script idempotently upserts the mock catalogue + a seeded admin user
 * (credentials come from ADMIN_EMAIL / ADMIN_PASSWORD env vars).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS, COUPONS, USERS, TESTIMONIALS } from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "bags.art.pk@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    // Ensure existing rows have emailVerified set so a re-seed against a
    // live DB doesn't accidentally lock the admin out after we shipped
    // the "verify email before login" gate.
    update: { emailVerified: new Date() },
    create: {
      name: "BagsArt Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  // Seed additional sample customer accounts (passwords default to "password").
  // Marked as verified so demo / test accounts can log in immediately.
  for (const u of USERS.filter((x) => x.role !== "admin")) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { emailVerified: new Date() },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: await bcrypt.hash("password", 12),
        role: "customer",
        emailVerified: new Date(),
      },
    });
  }

  for (const p of PRODUCTS) {
    // Re-seed updates the pricing + copy on existing rows too. Stock is
    // deliberately excluded so re-seeding a live store doesn't overwrite
    // the true on-hand count.
    const data = {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: p.price,
      compareAt: p.compareAt,
      currency: p.currency,
      category: p.category,
      collection: p.collection,
      colors: p.colors,
      materials: p.materials,
      images: p.images,
      featured: !!p.featured,
      rating: p.rating,
      reviewCount: p.reviewCount,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { ...data, stock: p.stock },
    });
  }

  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        active: c.active,
        uses: c.uses,
      },
    });
  }

  // ── Featured homepage reviews ────────────────────────────────────────
  // Turn the three mock testimonials into real Review rows so the
  // homepage has social proof from day one — moderatable from the admin
  // once real customer reviews start coming in. We used to hard-code
  // the target product slugs, which broke the moment the admin wiped
  // + re-added products with different slugs. Now we grab the first
  // three products in the DB (oldest first for stability) so this seed
  // "just works" regardless of what the admin has in stock.
  const productsForReviews = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    take: TESTIMONIALS.length,
    select: { id: true, slug: true },
  });
  if (productsForReviews.length === 0) {
    console.log(
      "ℹ  No products found — skipping seeded reviews. Add products from /admin, then re-run seed."
    );
  }
  for (let i = 0; i < productsForReviews.length; i++) {
    const t = TESTIMONIALS[i];
    const product = productsForReviews[i];

    // Each seeded testimonial gets its own reviewer user (verified so
    // they can technically log in). Email is a synthetic address that
    // won't collide with real signups.
    const email = `seed.${t.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@bagsart.internal`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: t.name },
      create: {
        name: t.name,
        email,
        role: "customer",
        emailVerified: new Date(),
        // No passwordHash — these are display-only accounts, no login.
      },
      select: { id: true },
    });

    // Idempotent: skip if THIS reviewer already has a review anywhere
    // (they only ever leave one — prevents a re-run from creating
    // duplicates against a newly-added second product).
    const existing = await prisma.review.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        author: t.name,
        rating: 5,
        title: t.role, // repurpose the "role" line as the review headline
        body: t.quote,
        images: [],
        approved: true,
        featured: true,
      },
    });
  }

  console.log("✔  Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
