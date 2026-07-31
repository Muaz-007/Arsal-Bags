/**
 * Full pre-launch reset.
 *
 * Nukes every content + user + config row in the database so the store
 * is a clean slate. The ONE thing kept is admin user(s) — so the admin
 * panel stays reachable after the wipe and you don't lock yourself out.
 *
 * DELETES (in dependency order):
 *   • Reviews
 *   • Wishlist items
 *   • Order items → Orders
 *   • Products
 *   • Saved addresses
 *   • Password reset tokens
 *   • Email verification codes
 *   • Non-admin users
 *   • Coupons
 *   • Newsletter subscribers
 *   • Contact messages
 *   • Storefront config (hero slides, category strip, featured picks)
 *
 * KEEPS:
 *   • Admin user(s) — so you can still log into /admin
 *
 * Run with:  npx tsx prisma/wipe-all.ts
 * or:        npm run db:wipe-all
 *
 * ⚠️  DESTRUCTIVE. Cannot be undone. Use only pre-launch or after
 * backing up the database.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  FULL WIPE — this cannot be undone.");
  console.log("   Preserving admin users only.\n");

  // ── User-linked children (deleted BEFORE the user rows, in FK order) ──
  const reviews = await prisma.review.deleteMany({});
  console.log(`  🗑  Reviews:              ${reviews.count}`);

  const wishlist = await prisma.wishlistItem.deleteMany({});
  console.log(`  🗑  Wishlist items:       ${wishlist.count}`);

  const orderItems = await prisma.orderItem.deleteMany({});
  console.log(`  🗑  Order items:          ${orderItems.count}`);

  const orders = await prisma.order.deleteMany({});
  console.log(`  🗑  Orders:               ${orders.count}`);

  const products = await prisma.product.deleteMany({});
  console.log(`  🗑  Products:             ${products.count}`);

  // Non-admin users' dependent rows first, then the users themselves.
  const doomedUserIds = (
    await prisma.user.findMany({
      where: { role: { not: "admin" } },
      select: { id: true },
    })
  ).map((u) => u.id);

  const addresses = await prisma.savedAddress.deleteMany({
    where: { userId: { in: doomedUserIds } },
  });
  console.log(`  🗑  Saved addresses:      ${addresses.count}`);

  const resetTokens = await prisma.passwordResetToken.deleteMany({
    where: { userId: { in: doomedUserIds } },
  });
  console.log(`  🗑  Password reset:       ${resetTokens.count}`);

  const verifyCodes = await prisma.emailVerificationCode.deleteMany({
    where: { userId: { in: doomedUserIds } },
  });
  console.log(`  🗑  Verification codes:   ${verifyCodes.count}`);

  const users = await prisma.user.deleteMany({
    where: { role: { not: "admin" } },
  });
  console.log(`  🗑  Non-admin users:      ${users.count}`);

  // ── Standalone tables ──────────────────────────────────────────────
  const coupons = await prisma.coupon.deleteMany({});
  console.log(`  🗑  Coupons:              ${coupons.count}`);

  const subscribers = await prisma.subscriber.deleteMany({});
  console.log(`  🗑  Subscribers:          ${subscribers.count}`);

  const messages = await prisma.contactMessage.deleteMany({});
  console.log(`  🗑  Contact messages:     ${messages.count}`);

  const storefront = await prisma.storefrontConfig.deleteMany({});
  console.log(`  🗑  Storefront config:    ${storefront.count}`);

  // ── Confirm what survived ──────────────────────────────────────────
  const adminsLeft = await prisma.user.count({ where: { role: "admin" } });
  console.log(
    `\n✔  Wipe complete. ${adminsLeft} admin${adminsLeft === 1 ? "" : "s"} preserved.`
  );
  console.log("   Sign into /admin and rebuild from scratch:");
  console.log("     • /admin/products/new         — add products");
  console.log("     • /admin/storefront            — pick hero, strip, featured");
  console.log("     • /admin/coupons               — create discount codes");
  console.log("   Or seed sample data:  npm run db:seed");
}

main()
  .catch((err) => {
    console.error("✗ Wipe failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
