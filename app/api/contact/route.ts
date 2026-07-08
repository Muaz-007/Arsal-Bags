import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(40),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  // 5 contact messages per IP per hour — generous, but caps spam runs.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `contact:${ip}`,
    max: 5,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  // Persist to the DB — /admin/messages is now the single inbox admins
  // check. We used to also email bags.art.pk@gmail.com from here, but that
  // duplicated the record (and cluttered the mailbox with copies of
  // everything already visible in the panel).
  if (prisma) {
    await prisma.contactMessage
      .create({
        data: { name, email, subject, message },
      })
      .catch((err) => {
        console.error("[contact] failed to persist message", err);
      });
  }

  return NextResponse.json({ ok: true });
}
