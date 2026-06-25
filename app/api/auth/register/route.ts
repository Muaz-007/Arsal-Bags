import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

const Schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

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
