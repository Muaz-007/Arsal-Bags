"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { ReviewForm } from "@/components/product/review-form";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { Product, ProductReview } from "@/types";

type SortKey = "recent" | "highest" | "lowest";

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export function Reviews({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";

  const [sort, setSort] = useState<SortKey>("recent");
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...reviews];
    if (sort === "highest") arr.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") arr.sort((a, b) => a.rating - b.rating);
    // "recent" preserves DB order (createdAt desc from the query).
    return arr;
  }, [reviews, sort]);

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
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Sort
                </p>
                <div className="w-44">
                  <Dropdown
                    value={sort}
                    onChange={(v) => setSort(v as SortKey)}
                    options={SORT_OPTIONS}
                  />
                </div>
              </div>

              {sorted.map((review) =>
                editingId === review.id ? (
                  <ReviewForm
                    key={review.id}
                    productId={product.id}
                    existing={{
                      id: review.id,
                      rating: review.rating,
                      title: review.title,
                      body: review.body,
                      images: review.images,
                    }}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    canManage={
                      !!currentUserId &&
                      (isAdmin || review.userId === currentUserId)
                    }
                    onEdit={() => setEditingId(review.id)}
                  />
                )
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewRow({
  review,
  canManage,
  onEdit,
}: {
  review: ProductReview;
  canManage: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function remove() {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        push({
          title: "Couldn't delete",
          description: data?.error,
          tone: "error",
        });
        return;
      }
      push({ title: "Review removed", tone: "info" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <article className="border-b border-border pb-6 last:border-0">
        <div className="flex items-center justify-between">
          <p className="font-medium">{review.title}</p>
          <span className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Rating value={review.rating} />
          <span className="text-xs text-muted-foreground">
            — {review.author}
          </span>
          {review.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-3 w-3" />
              Verified buyer
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {review.body}
        </p>

        {review.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.images.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightbox(url)}
                className="relative h-20 w-20 rounded-md overflow-hidden border border-border hover:opacity-90 transition"
                aria-label="View photo"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {canManage && (
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 px-2 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={remove}
              loading={deleting}
              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </article>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 grid place-items-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] w-full h-full">
            <Image
              src={lightbox}
              alt=""
              fill
              sizes="90vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
