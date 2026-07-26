"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useWishlist } from "@/store/wishlist";

/**
 * Floating WhatsApp button — bottom-right corner.
 *
 * Sits at the corner by default, and lifts above the wishlist FAB when
 * that button is on-screen (both otherwise occupy `bottom-5 right-5`).
 * Hidden on admin, auth, and checkout routes so it doesn't clutter
 * completion flows.
 *
 * Reads `NEXT_PUBLIC_WHATSAPP_NUMBER` at build time. The value should be
 * the *international* form without a leading `+` or spaces — for Pakistan
 * that's `92XXXXXXXXXX` (drop the leading 0). When the env var isn't set
 * the button won't render, so a partial deploy stays quiet rather than
 * shipping a broken tap target.
 */
export function WhatsAppFab() {
  const pathname = usePathname();
  const wishlistCount = useWishlist((s) => s.ids.length);

  // Reads from process.env at build time — Next.js inlines it into the
  // client bundle when the key starts with `NEXT_PUBLIC_`. Empty / unset
  // → we render nothing so an unconfigured deploy stays silent.
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) return null;

  // Same hide-list as the wishlist FAB. Chat prompt on the admin panel
  // or mid-checkout feels intrusive.
  const hidden =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/checkout");
  if (hidden) return null;

  // Pre-fill a friendly opener. `wa.me` accepts a URL-encoded `text`
  // param that lands in the recipient's compose box on both mobile and
  // desktop clients.
  const message = encodeURIComponent(
    "Hi BagsArt — I have a question about your bags."
  );
  const href = `https://wa.me/${number}?text=${message}`;

  // Mirror the wishlist FAB's actual visibility (not just item count) so
  // we don't leave an awkward gap on /wishlist itself, where the FAB
  // hides but the count is still > 0.
  const wishlistVisible =
    wishlistCount > 0 &&
    pathname !== "/wishlist" &&
    pathname !== "/dashboard/wishlist";

  return (
    <AnimatePresence>
      <motion.div
        key="whatsapp-fab"
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.9 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-5 z-40"
        // Bottom position lives in inline `style`, not framer's `animate`,
        // for two reasons:
        //   1. If it sits in `animate`, framer has no starting value on
        //      first mount and interpolates from the browser default
        //      (which resolves to 0), producing a jarring slide up from
        //      the viewport bottom every page load.
        //   2. Native CSS transition on `bottom` is smoother than
        //      framer's transform pipeline for a plain positional change,
        //      which is all we need when the wishlist FAB appears.
        style={{
          bottom: wishlistVisible ? "5.25rem" : "1.25rem",
          transition: "bottom 350ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with BagsArt on WhatsApp"
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-1 ring-black/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition"
        >
          <WhatsAppIcon className="h-6 w-6 text-white" />

          {/* Soft pulsing halo — quiet visual cue that the button is
              active without shouting. Slow, low opacity so it doesn't
              distract from the page. */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none"
            style={{ animationDuration: "2.4s" }}
          />
        </a>
      </motion.div>
    </AnimatePresence>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  // Official WhatsApp logo (public brand mark) as inline SVG. Lucide
  // doesn't ship a WhatsApp glyph — trademark reasons — so we draw it
  // here rather than pull in another icon package.
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
