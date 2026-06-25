import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

const ProductSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().optional(),
  category: z.string(),
  collection: z.string().optional(),
  stock: z.coerce.number().int().nonnegative(),
  images: z.string(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const data = parsed.data;
  const images = data.images
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!prisma) {
    // Mock mode — return a fake id so the UI proceeds.
    return NextResponse.json({
      id: `mock_${Date.now()}`,
      slug: slugify(data.name),
    });
  }

  const product = await prisma.product.create({
    data: {
      slug: slugify(data.name),
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      price: data.price,
      compareAt: data.compareAt,
      category: data.category,
      collection: data.collection,
      stock: data.stock,
      colors: [],
      materials: [],
      images,
    },
    select: { id: true, slug: true },
  });
  return NextResponse.json(product, { status: 201 });
}
