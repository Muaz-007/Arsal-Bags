import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { slugify } from "@/lib/utils";

const PatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    tagline: z.string().min(1).max(300).optional(),
    description: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    compareAt: z.coerce.number().positive().nullable().optional(),
    category: z.string().optional(),
    collection: z.string().nullable().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    featured: z.boolean().optional(),
    images: z.string().optional(), // newline-separated URLs
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No changes" });

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/** PATCH /api/admin/products/[id] — update fields. Regenerates slug only
 *  when name changes (slug is part of the public URL). */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!prisma) return NextResponse.json({ ok: true });

  const data = parsed.data;
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) {
    update.name = data.name;
    update.slug = slugify(data.name);
  }
  if (data.tagline !== undefined) update.tagline = data.tagline;
  if (data.description !== undefined) update.description = data.description;
  if (data.price !== undefined) update.price = data.price;
  if (data.compareAt !== undefined) update.compareAt = data.compareAt;
  if (data.category !== undefined) update.category = data.category;
  if (data.collection !== undefined) update.collection = data.collection;
  if (data.stock !== undefined) update.stock = data.stock;
  if (data.featured !== undefined) update.featured = data.featured;
  if (data.images !== undefined) {
    update.images = data.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  try {
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: update,
      select: { id: true, slug: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/products/[id] — hard delete a product. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ ok: true });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}
