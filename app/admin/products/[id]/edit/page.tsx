import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/queries";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();
  return <ProductForm initial={product} />;
}
