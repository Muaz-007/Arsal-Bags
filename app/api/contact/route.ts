import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
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

  await sendContactMessage("bags.art.pk@gmail.com", {
    name,
    email,
    subject,
    message,
  });

  return NextResponse.json({ ok: true });
}
