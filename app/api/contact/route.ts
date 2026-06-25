import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(40),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  await sendEmail({
    to: "hello@bagsart.dev",
    replyTo: email,
    subject: `[Contact · ${subject}] ${name}`,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
