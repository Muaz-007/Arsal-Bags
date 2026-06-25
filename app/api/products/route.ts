import { NextResponse } from "next/server";
import { listProducts } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = await listProducts({
    category: searchParams.get("category") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
    search: searchParams.get("q") ?? undefined,
    sort: (searchParams.get("sort") as any) ?? undefined,
    inStock: searchParams.get("inStock") === "1",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    perPage: searchParams.get("perPage") ? Number(searchParams.get("perPage")) : undefined,
  });
  return NextResponse.json(result);
}
