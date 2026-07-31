/**
 * Pre-launch users wipe.
 *
 * Removes every customer account plus the personal data attached to
 * them, while preserving admin users so the admin panel stays reachable
 * after the wipe. Intended for pre-launch clean-slate — running this
 * against a live store deletes real customer data with no undo.
 *
 * DELETES:
 *   • All customer users (role !== "admin")
 *   • Saved addresses tied to those users
 *   • Password reset tokens tied to those users
 *   • Email verification codes tied to those users
 *   • Any seeded review users (seed.*@bagsart.internal) — orphaned after
 *     the catalogue wipe removed their reviews
 *
 * KEEPS:
 *   • Admin users (so the panel stays accessible)
 *   • Newsletter subscribers (separate marketing list, not user-linked)
 *   • Contact messages (support history)
 *   • Coupons
 *
 * Run with:  npx tsx prisma/wipe-users.ts
 * or:        npm run db:wipe-users
 *
 * ⚠️  DESTRUCTIVE. Run only pre-launch or after backing up.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Wiping non-admin users — this cannot be undone.");

  // Grab the IDs of every non-admin user first so we can clean up their
  // dependent rows explicitly. Deleting the User row alone would fail
  // for the tables without `onDelete: Cascade` on their FK.
  const doomed = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    select: { id: true, email: true },
  });
  const doomedIds = doomed.map((u) => u.id);

  if (doomedIds.length === 0) {
    console.log("ℹ  No non-admin users to remove.");
    return;
  }

  const addresses = await prisma.savedAddress.deleteMany({
    where: { userId: { in: doomedIds } },
  });
  console.log(`  🗑  Saved addresses:      ${addresses.count}`);

  const resetTokens = await prisma.passwordResetToken.deleteMany({
    where: { userId: { in: doomedIds } },
  });
  console.log(`  🗑  Password reset:       ${resetTokens.count}`);

  const verifyCodes = await prisma.emailVerificationCode.deleteMany({
    where: { userId: { in: doomedIds } },
  });
  console.log(`  🗑  Verification codes:   ${verifyCodes.count}`);

  const users = await prisma.user.deleteMany({
    where: { role: { not: "admin" } },
  });
  console.log(`  🗑  Users:                ${users.count}`);

  const adminsLeft = await prisma.user.count({ where: { role: "admin" } });
  console.log(
    `\n✔  Users wiped. ${adminsLeft} admin${adminsLeft === 1 ? "" : "s"} preserved.`
  );
  console.log(
    "   Newsletter subscribers, contact messages, and coupons untouched."
  );
}

main()
  .catch((err) => {
    console.error("✗ Wipe failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
