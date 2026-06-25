import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  key: z.enum(["hero", "strip", "featured", "bestsellers", "sale"]),
  value: z.any(),
});

/**
 * PUT /api/admin/storefront — admin-only upsert of a homepage section.
 * Persists into `StorefrontConfig` keyed by section name so the homepage
 * server components can read it without a migration per shape change.
 */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { key, value } = parsed.data;

  if (!prisma) {
    return NextResponse.json({ ok: true, key, value });
  }

  const row = await prisma.storefrontConfig.upsert({
    where: { key },
    update: { value, updatedBy: user.id },
    create: { key, value, updatedBy: user.id },
  });
  return NextResponse.json({ ok: true, key: row.key, value: row.value });
}

/** GET /api/admin/storefront?key=hero — read one section. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  if (!prisma) return NextResponse.json({ value: null });

  const row = await prisma.storefrontConfig.findUnique({ where: { key } });
  return NextResponse.json({ value: row?.value ?? null });
}
