import { redirect } from "next/navigation";

/**
 * Backwards-compatible redirect — the wishlist now lives at the public
 * `/wishlist` URL so guests can reach it too.
 */
export default function DashboardWishlistRedirect() {
  redirect("/wishlist");
}
