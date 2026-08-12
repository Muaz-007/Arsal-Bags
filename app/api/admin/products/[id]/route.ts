import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { slugify } from "@/lib/utils";

const SpecificationEntry = z.object({
  label: z.string().min(1).max(60),
  value: z.string().min(1).max(200),
});

// Empty strings from a cleared form input coerce to 0, which fails
// `z.number().positive()`. Preprocess "" → null for the optional numeric
// fields so a cleared "Compare-at" saves as "no sale price" instead of
// 400ing the whole PATCH.
const emptyToNull = (v: unknown) => (v === "" ? null : v);

const PatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    tagline: z.string().min(1).max(300).optional(),
    description: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    compareAt: z.preprocess(
      emptyToNull,
      z.coerce.number().positive().nullable().optional()
    ),
    category: z.string().optional(),
    collection: z.string().nullable().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    featured: z.boolean().optional(),
    images: z.string().optional(), // newline-separated URLs
    // JSON-encoded array of { label, value } rows. Empty string clears.
    specifications: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No changes" });

function parseSpecifications(raw: string) {
  if (raw.trim() === "") return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr
      .map((r) => SpecificationEntry.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: { label: string; value: string } }).data);
  } catch {
    return null;
  }
}

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
  if (data.collection !== undefined) {
    // Empty string from the "None" option → null so it clears cleanly.
    update.collection = data.collection && data.collection.trim() !== ""
      ? data.collection
      : null;
  }
  if (data.stock !== undefined) update.stock = data.stock;
  if (data.featured !== undefined) update.featured = data.featured;
  if (data.images !== undefined) {
    update.images = data.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (data.specifications !== undefined) {
    const specs = parseSpecifications(data.specifications);
    if (specs !== null) {
      // Empty array clears the row set; non-empty replaces it.
      update.specifications = specs.length > 0 ? specs : [];
    }
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
