import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ProductGallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
import { Reviews } from "@/components/product/reviews";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { formatPrice } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  const url = `${SITE_URL}/products/${product.slug}`;
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.tagline,
      url,
      type: "website",
      siteName: SITE_NAME,
      images: product.images.map((src) => ({
        url: src,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.tagline,
      images: [product.images[0]],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(params.slug);
  const onSale = product.compareAt && product.compareAt > product.price;

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  // Product schema.org JSON-LD for rich Google results
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // Breadcrumb JSON-LD helps Google show a breadcrumb trail in search results
  // instead of the raw URL.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: `${SITE_URL}/products?category=${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape `<` so a product name containing `</script>` can't break
        // out of the script tag. Defense-in-depth even though only admins
        // can write product names.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="container py-12 lg:py-16">
        <nav className="text-xs text-muted-foreground mb-6">
          <span>Shop</span>
          <span className="mx-2">/</span>
          <span className="capitalize">{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2">
          <ProductGallery
            images={product.images}
            alt={product.name}
            color={product.colors[0]}
          />

          <div className="lg:pt-4">
            {onSale && <Badge variant="gold">On sale</Badge>}
            <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{product.tagline}</p>

            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-display text-3xl">{formatPrice(product.price)}</p>
              {onSale && (
                <p className="text-base text-muted-foreground line-through">
                  {formatPrice(product.compareAt!)}
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Rating value={product.rating} />
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </span>
            </div>

            <p className="mt-8 leading-relaxed text-foreground/90">
              {product.description}
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
              {product.materials.map((m) => (
                <li key={m} className="text-muted-foreground">
                  · {m}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <AddToCart product={product} />
            </div>
          </div>
        </div>
      </article>

      <Reviews product={product} />

      {related.length > 0 && (
        <section className="container py-16">
          <SectionHeader eyebrow="You may also like" title="Pieces in the same family" />
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
