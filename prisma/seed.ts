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
  // The three mock testimonials become real Review rows tied to the
  // products they mention, so the homepage keeps its social proof from
  // day one but every quote is now a moderatable record the admin can
  // swap out. Marked approved + featured so they surface immediately.
  const testimonialProductSlugs = [
    "florence-tote-cognac",
    "atelier-backpack-noir",
    "milano-shoulder-noir",
  ];
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    const productSlug = testimonialProductSlugs[i];
    if (!productSlug) continue;

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) continue;

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

    // Idempotent: skip if a review already exists for this (user, product)
    // pair. Prevents re-seed from duplicating the same testimonial.
    const existing = await prisma.review.findFirst({
      where: { userId: user.id, productId: product.id },
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
