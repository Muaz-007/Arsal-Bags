import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  // In production: forward to Klaviyo / Resend / Mailchimp.
  console.info("[newsletter] subscribed", parsed.data.email);
  return NextResponse.json({ ok: true });
}
