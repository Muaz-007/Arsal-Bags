/**
 * Pre-launch catalogue wipe.
 *
 * Deletes every product plus everything that references a product so the
 * admin can start fresh with real inventory + real photos. Also clears
 * test orders / wishlist entries that would otherwise reference deleted
 * products and either fail the delete or leave orphaned rows.
 *
 * KEEPS (untouched):
 *   • Users (admin + any customer accounts)
 *   • Coupons
 *   • Newsletter subscribers
 *   • Contact form messages
 *   • Saved addresses
 *   • Password reset tokens / email verification codes
 *   • Storefront config (hero, strip, featured picks — but the product
 *     IDs inside them will point at deleted rows, so re-pick after
 *     adding new products from /admin/storefront)
 *
 * Run with:  npx tsx prisma/wipe-catalog.ts
 * or:        npm run db:wipe-catalog
 *
 * ⚠️  DESTRUCTIVE. Run only pre-launch or after backing up.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Wiping catalogue — this cannot be undone.");

  // Delete in dependency order — children first, then parents.
  const reviews = await prisma.review.deleteMany({});
  console.log(`  🗑  Reviews:      ${reviews.count}`);

  const wishlist = await prisma.wishlistItem.deleteMany({});
  console.log(`  🗑  Wishlist:     ${wishlist.count}`);

  const orderItems = await prisma.orderItem.deleteMany({});
  console.log(`  🗑  Order items:  ${orderItems.count}`);

  const orders = await prisma.order.deleteMany({});
  console.log(`  🗑  Orders:       ${orders.count}`);

  const products = await prisma.product.deleteMany({});
  console.log(`  🗑  Products:     ${products.count}`);

  console.log("\n✔  Catalogue wiped. Kept: users, coupons, subscribers, messages.");
  console.log("   Next: add real products from /admin/products/new.");
  console.log(
    "   Then re-pick featured / hero / strip in /admin/storefront."
  );
}

main()
  .catch((err) => {
    console.error("✗ Wipe failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
