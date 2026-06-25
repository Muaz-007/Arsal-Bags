import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const AddressSchema = z.object({
  label: z.string().max(40).optional().nullable(),
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(80),
  country: z.string().min(1).max(80),
  postal: z.string().min(1).max(20),
  phone: z.string().max(40).optional().nullable(),
  isDefault: z.boolean().optional(),
});

/** GET /api/addresses — list the signed-in user's saved addresses. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ addresses: [] });
  if (!prisma) return NextResponse.json({ addresses: [] });

  const rows = await prisma.savedAddress.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ addresses: rows });
}

/** POST /api/addresses — create a new saved address for the signed-in user. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save addresses." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  const data = parsed.data;
  if (!prisma) return NextResponse.json({ ok: true });

  const result = await prisma.$transaction(async (tx) => {
    // If this is the user's first address, default it on.
    const count = await tx.savedAddress.count({ where: { userId: user.id } });
    const isDefault = count === 0 || !!data.isDefault;

    if (isDefault) {
      await tx.savedAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.savedAddress.create({
      data: {
        userId: user.id,
        label: data.label ?? null,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        postal: data.postal,
        phone: data.phone ?? null,
        isDefault,
      },
    });
  });

  return NextResponse.json(result, { status: 201 });
}
