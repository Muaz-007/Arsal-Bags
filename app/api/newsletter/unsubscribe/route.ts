import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUnsubscribe } from "@/lib/newsletter-token";

/**
 * GET /api/newsletter/unsubscribe?email=&token=
 *
 * Public one-click unsubscribe. Called by the confirmation page after the
 * subscriber clicks the footer link. Sets `active=false` — we keep the row
 * so a re-subscribe still hits the same record (and we can measure churn).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.toLowerCase().trim();
  const token = url.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
  }
  if (!verifyUnsubscribe(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (prisma) {
    await prisma.subscriber
      .update({
        where: { email },
        data: { active: false },
      })
      .catch(() => {
        // Row missing? Idempotent: pretend success — the effect is the
        // same (nobody's on the list under this address).
      });
  }

  return NextResponse.json({ ok: true, email });
}
