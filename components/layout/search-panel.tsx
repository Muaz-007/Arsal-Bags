"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchPanel } from "@/store/search";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { formatPrice } from "@/lib/utils";

/**
 * Site-wide search overlay with live autocomplete.
 *
 *  - Debounced fetch to /api/search after 2+ characters
 *  - Top-6 product matches shown inline with thumbnail, name, price
 *  - "See all results" CTA jumps to the filtered catalogue
 *  - When empty, shows "Jump to" chips + "Popular searches"
 *  - Body scroll locked while open; Esc / scrim / × all close
 */

interface Hit {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  category: string;
}

const QUICK_LINKS = [
  { label: "All products", href: "/products" },
  { label: "Best sellers", href: "/products?sort=popular" },
  { label: "On sale", href: "/products?sale=1" },
  { label: "New in", href: "/products?sort=latest" },
  { label: "Totes", href: "/products?category=tote" },
  { label: "Backpacks", href: "/products?category=backpack" },
  { label: "Crossbody", href: "/products?category=crossbody" },
  { label: "Wallets", href: "/products?category=wallet" },
];

const POPULAR = ["Florence Tote", "Atelier Backpack", "Soirée Clutch"];

export function SearchPanel() {
  const open = useSearchPanel((s) => s.open);
  const setOpen = useSearchPanel((s) => s.setOpen);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Only honour the catalogue filters while the shopper is on /products —
  // searching from the homepage should stay unfiltered. `category`, `price`
  // (min-max) and `sale` are the filters the products page controls.
  const activeFilters = useMemo(() => {
    if (!pathname?.startsWith("/products")) return {} as Record<string, string>;
    const out: Record<string, string> = {};
    const category = searchParams.get("category");
    const price = searchParams.get("price");
    const sale = searchParams.get("sale");
    if (category) out.category = category;
    if (price) out.price = price;
    if (sale === "1") out.sale = "1";
    return out;
  }, [pathname, searchParams]);

  const filterQueryString = useMemo(() => {
    const qs = new URLSearchParams(activeFilters).toString();
    return qs ? `&${qs}` : "";
  }, [activeFilters]);

  useBodyScrollLock(open);

  // Autofocus on open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setHits([]);
  }

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced live search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}${filterQueryString}`,
          {
            signal: ctrl.signal,
          }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { products: Hit[] };
        setHits(data.products);
      } catch {
        // ignored — likely aborted
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterQueryString]);

  function go(href: string) {
    router.push(href);
    close();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    go(`/products?q=${encodeURIComponent(q)}${filterQueryString}`);
  }

  const hasQuery = query.trim().length >= 2;
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="search-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-md"
            onClick={close}
          />
          <motion.div
            key="search-card"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[8vh] sm:top-[12vh] z-[60] flex items-start justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Input bar */}
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-3 px-4 sm:px-5 h-14 sm:h-16 border-b border-border transition-colors focus-within:bg-muted/30"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bags, wallets, collections…"
                  aria-label="Search the catalogue"
                  className="flex-1 h-full bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground/55 focus:outline-none focus-visible:outline-none focus-visible:[box-shadow:none]"
                />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>

              {/* Active-filter hint — tells the shopper their catalogue
                  filters are also constraining these search results, so
                  "no matches" isn't misread as "product doesn't exist". */}
              {activeFilterCount > 0 && (
                <div className="px-5 py-2.5 border-b border-border bg-gold/5 text-[11px] text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                  Searching within your active filter{activeFilterCount === 1 ? "" : "s"}.
                </div>
              )}

              {/* Content */}
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
                {hasQuery ? (
                  <div>
                    {hits.length === 0 && !loading ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No matches for "{query}".
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            go(
                              `/products?q=${encodeURIComponent(query)}${filterQueryString}`
                            )
                          }
                          className="mt-3 text-sm underline decoration-gold underline-offset-4"
                        >
                          Search the whole catalogue
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                          Top matches
                        </p>
                        <ul className="space-y-0.5">
                          {hits.map((p) => (
                            <li key={p.id}>
                              <Link
                                href={`/products/${p.slug}`}
                                onClick={close}
                                className="flex items-center gap-3 rounded-md px-2.5 py-2 hover:bg-muted transition"
                              >
                                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                                  <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate capitalize">
                                    {p.category} · {p.tagline}
                                  </p>
                                </div>
                                <span className="text-sm font-medium shrink-0">
                                  {formatPrice(p.price)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() =>
                            go(
                              `/products?q=${encodeURIComponent(query)}${filterQueryString}`
                            )
                          }
                          className="w-full mt-3 flex items-center justify-center gap-2 h-10 rounded-md border border-border hover:bg-muted text-sm transition"
                        >
                          See all results for "{query}"
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                        Jump to
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_LINKS.map((q) => (
                          <Link
                            key={q.href}
                            href={q.href}
                            onClick={close}
                            className="inline-flex items-center h-8 px-3 rounded-full text-xs border border-border bg-background hover:border-foreground/30 hover:bg-muted transition"
                          >
                            {q.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                        Popular searches
                      </p>
                      <ul className="space-y-0.5">
                        {POPULAR.map((p) => (
                          <li key={p}>
                            <button
                              type="button"
                              onClick={() => setQuery(p)}
                              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/85 hover:text-foreground hover:bg-muted transition"
                            >
                              <Search className="h-3.5 w-3.5 text-muted-foreground" />
                              {p}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-border bg-muted/30 hidden sm:block">
                <p className="text-[11px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  to search ·{" "}
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">
                    Esc
                  </kbd>{" "}
                  to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
