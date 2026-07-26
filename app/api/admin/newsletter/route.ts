import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { sendNewsletterBroadcast } from "@/lib/email";
import { unsubscribeUrl } from "@/lib/newsletter-token";
import { SITE_URL } from "@/lib/site";

const Schema = z.object({
  heading: z.string().min(1).max(200),
  // The composer emits paragraph-preserved HTML (see composer client for
  // the sanitising it does). Cap at 40KB so a runaway paste can't blow
  // through email size limits.
  bodyHtml: z.string().min(1).max(40_000),
  // Test mode → send only to the admin's own address so they can preview.
  test: z.boolean().optional(),
});

/**
 * POST /api/admin/newsletter
 *
 * Blast a newsletter to every ACTIVE subscriber. Admin-only. Sends via
 * Resend one-by-one (small list, no queue needed yet); each message
 * carries a unique unsubscribe link keyed to the recipient's email.
 *
 * `test: true` narrows the recipient list to just the calling admin's
 * address so we don't spam the whole list while iterating.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { heading, bodyHtml, test } = parsed.data;

  // Gather recipients: test mode → admin only; otherwise every active row.
  let recipients: string[] = [];
  if (test) {
    if (!user.email) {
      return NextResponse.json(
        { error: "Test send needs an admin email on file" },
        { status: 400 }
      );
    }
    recipients = [user.email.toLowerCase().trim()];
  } else if (prisma) {
    const rows = await prisma.subscriber.findMany({
      where: { active: true },
      select: { email: true },
    });
    recipients = rows.map((r) => r.email);
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No active subscribers to send to." },
      { status: 400 }
    );
  }

  // Send sequentially so a Resend rate-limit trips one send, not the
  // whole batch. For >200 subscribers we should move to a queue, but at
  // BagsArt's current scale this is fine.
  let sent = 0;
  let failed = 0;
  for (const email of recipients) {
    try {
      const link = unsubscribeUrl(email, SITE_URL);
      await sendNewsletterBroadcast(email, {
        heading,
        bodyHtml,
        unsubscribeUrl: link,
      });
      sent++;
    } catch (err) {
      console.error("[newsletter] send failed for", email, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: recipients.length });
}
