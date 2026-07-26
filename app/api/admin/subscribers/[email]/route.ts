import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * DELETE /api/admin/subscribers/[email]
 *
 * Hard-delete a subscriber row. Used from the admin Users page when a
 * subscriber writes in asking to be removed manually (or when we're
 * cleaning up test data). Different from unsubscribe — which flips
 * `active` but keeps the row for churn analytics.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { email: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!prisma) return NextResponse.json({ ok: true });

  const email = decodeURIComponent(params.email).toLowerCase().trim();

  try {
    await prisma.subscriber.delete({ where: { email } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
}
