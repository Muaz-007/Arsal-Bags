"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/store/wishlist";

/**
 * Wishlist server sync.
 *
 * Mounted once at the layout level. The moment the user becomes
 * authenticated:
 *   1. Pull the server-side wishlist IDs.
 *   2. Find any guest-side IDs not on the server and POST them.
 *   3. Merge both sets and set the local store to the union.
 *
 * On sign-out the local store keeps whatever was there — so a customer who
 * was browsing and saved a few hearts as a guest doesn't lose them.
 */
export function WishlistSync() {
  const { status } = useSession();
  const ids = useWishlist((s) => s.ids);
  const setIds = useWishlist((s) => s.setIds);
  const setAuthed = useWishlist((s) => s.setAuthed);
  const synced = useRef(false);

  // Keep the store informed of auth state. `toggle()` checks this before
  // POSTing — guests stay local-only, no 401s in the console.
  useEffect(() => {
    setAuthed(status === "authenticated");
  }, [status, setAuthed]);

  useEffect(() => {
    if (status !== "authenticated" || synced.current) return;
    synced.current = true;

    (async () => {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ids: string[] };
        const serverIds = new Set(data.ids ?? []);
        const localIds = new Set(ids);

        // Push any guest-added IDs that the server doesn't know about yet.
        const toPush = [...localIds].filter((x) => !serverIds.has(x));
        await Promise.all(
          toPush.map((productId) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ productId }),
            }).catch(() => null)
          )
        );

        // Union for the local store.
        setIds([...new Set([...serverIds, ...localIds])]);
      } catch {
        // Swallow — local state is the safe fallback.
      }
    })();
  }, [status, ids, setIds]);

  // Reset the synced flag if the user signs out so a future sign-in re-runs.
  useEffect(() => {
    if (status === "unauthenticated") synced.current = false;
  }, [status]);

  return null;
}
