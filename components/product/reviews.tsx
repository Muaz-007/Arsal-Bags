import { Rating } from "@/components/ui/rating";
import { ReviewForm } from "@/components/product/review-form";
import { formatDate } from "@/lib/utils";
import type { Product } from "@/types";

export function Reviews({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];
  return (
    <section className="container py-16 border-t border-border">
      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Reviews
            </p>
            <p className="mt-3 font-display text-5xl">
              {product.rating.toFixed(1)}
            </p>
            <Rating value={product.rating} size={18} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              From {product.reviewCount} verified buyers
            </p>
          </div>
          <ReviewForm productId={product.id} />
        </div>

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No reviews yet — be the first to share your thoughts.
            </p>
          ) : (
            reviews.map((r) => (
              <article
                key={r.id}
                className="border-b border-border pb-6 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Rating value={r.rating} />
                  <span className="text-xs text-muted-foreground">
                    — {r.author}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {r.body}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
