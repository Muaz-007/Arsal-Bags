"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Home, Star, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";
import type { AdminReviewRow } from "@/lib/queries";

type FilterKey = "pending" | "approved" | "all";

/**
 * Admin review moderation section.
 *
 * Lives under `/admin/orders` as a sibling section to the orders table —
 * both are post-purchase concerns, so grouping them keeps the mental
 * model tight. Filters default to "Pending" so the queue that needs
 * attention is what shows up when the page loads.
 */
export function ReviewsSection({ initial }: { initial: AdminReviewRow[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [items, setItems] = useState<AdminReviewRow[]>(initial);
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "pending") return items.filter((r) => !r.approved);
    if (filter === "approved") return items.filter((r) => r.approved);
    return items;
  }, [items, filter]);

  const pendingCount = items.filter((r) => !r.approved).length;

  async function moderate(id: string, approved: boolean) {
    setBusyId(id);
    const before = items;
    setItems((arr) =>
      arr.map((r) =>
        // Unapproving also drops featured — mirrors the server behavior
        // so the optimistic UI matches what the DB ends up storing.
        r.id === id
          ? { ...r, approved, featured: approved ? r.featured : false }
          : r
      )
    );
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setBusyId(null);
    if (!res.ok) {
      setItems(before);
      push({ title: "Couldn't update review", tone: "error" });
      return;
    }
    push({
      title: approved ? "Review published" : "Review hidden",
      tone: "success",
    });
    router.refresh();
  }

  async function toggleFeatured(id: string, featured: boolean) {
    setBusyId(id);
    const before = items;
    setItems((arr) =>
      arr.map((r) => (r.id === id ? { ...r, featured } : r))
    );
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ featured }),
    });
    setBusyId(null);
    if (!res.ok) {
      setItems(before);
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      push({
        title: "Couldn't update",
        description: data.error,
        tone: "error",
      });
      return;
    }
    push({
      title: featured
        ? "Featured on homepage"
        : "Removed from homepage",
      tone: "success",
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setBusyId(id);
    const before = items;
    setItems((arr) => arr.filter((r) => r.id !== id));
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      setItems(before);
      push({ title: "Couldn't delete", tone: "error" });
      return;
    }
    push({ title: "Review deleted", tone: "info" });
    router.refresh();
  }

  const FilterChip = ({ value, label }: { value: FilterKey; label: string }) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition",
        filter === value
          ? "bg-foreground text-background"
          : "border border-border hover:border-foreground/30 hover:bg-muted"
      )}
    >
      {label}
      {value === "pending" && pendingCount > 0 && filter !== value && (
        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-gold text-black text-[10px]">
          {pendingCount}
        </span>
      )}
    </button>
  );

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl">Reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} total ·{" "}
            <strong className="text-foreground">{pendingCount}</strong> waiting
            for approval.
          </p>
        </div>
        <div className="flex gap-2">
          <FilterChip value="pending" label="Pending" />
          <FilterChip value="approved" label="Approved" />
          <FilterChip value="all" label="All" />
        </div>
      </header>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-muted">
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {filter === "pending"
                ? "Inbox zero — no reviews waiting."
                : filter === "approved"
                  ? "No approved reviews yet."
                  : "No reviews yet. They'll appear here once customers write them."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Product thumb */}
                    {r.productImage && r.productSlug ? (
                      <Link
                        href={`/products/${r.productSlug}`}
                        target="_blank"
                        className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted"
                      >
                        <Image
                          src={r.productImage}
                          alt={r.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {r.productName}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold truncate">
                            {r.title}
                          </p>
                        </div>
                        <div className="flex gap-1.5 items-center shrink-0">
                          {r.featured && (
                            <Badge variant="gold">
                              <Home className="h-3 w-3 mr-1" /> Homepage
                            </Badge>
                          )}
                          <Badge variant={r.approved ? "success" : "warning"}>
                            {r.approved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      </div>

                      {/* Stars + meta */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={cn(
                                "h-3.5 w-3.5",
                                n <= r.rating
                                  ? "fill-gold text-gold"
                                  : "fill-muted text-muted-foreground/40"
                              )}
                            />
                          ))}
                        </span>
                        <span>·</span>
                        <span>{r.author}</span>
                        <span>·</span>
                        <span>{formatDate(r.createdAt)}</span>
                      </div>

                      {/* Body */}
                      <p className="mt-3 text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">
                        {r.body}
                      </p>

                      {/* Photos */}
                      {r.images.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {r.images.map((src, i) => (
                            <a
                              key={i}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-16 w-16 rounded-md overflow-hidden bg-muted border border-border"
                            >
                              <Image
                                src={src}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        {r.approved ? (
                          <button
                            type="button"
                            onClick={() => moderate(r.id, false)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs border border-border hover:border-foreground/40 hover:bg-muted transition disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" /> Unapprove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => moderate(r.id, true)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                        )}

                        {/* Feature-on-homepage — only meaningful after
                            approval. Hidden on pending rows to steer
                            admins to approve first. */}
                        {r.approved && (
                          <button
                            type="button"
                            onClick={() => toggleFeatured(r.id, !r.featured)}
                            disabled={busyId === r.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs transition disabled:opacity-50",
                              r.featured
                                ? "bg-gold/15 border border-gold/40 text-gold-dark dark:text-gold-light hover:bg-gold/25"
                                : "border border-border hover:border-foreground/40 hover:bg-muted"
                            )}
                            title={
                              r.featured
                                ? "Remove from homepage testimonials"
                                : "Show this review in the homepage testimonials section"
                            }
                          >
                            <Home className="h-3.5 w-3.5" />
                            {r.featured ? "On homepage" : "Feature on homepage"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50 ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
