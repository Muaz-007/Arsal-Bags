import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  // ── Rate limit: 5 signups per IP per 15 minutes ──────────────────────────
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `register:${ip}`,
    max: 5,
    windowMs: 15 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const { name, email: rawEmail, password } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  if (!prisma) {
    // Mock mode: pretend success so the UI flow completes.
    return NextResponse.json({ id: `mock_${Date.now()}`, name, email });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "customer" },
    select: { id: true, name: true, email: true },
  });

  // Fire-and-forget welcome email (transport handles its own errors).
  void sendWelcomeEmail(user.email, user.name);

  return NextResponse.json(user, { status: 201 });
}
