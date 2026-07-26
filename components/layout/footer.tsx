"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { FooterNewsletter } from "./footer-newsletter";
import { SUPPORT_EMAIL } from "@/lib/site";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bags_art_official/",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/14gt9w5emgu/",
    Icon: Facebook,
  },
];

const sections = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?category=tote", label: "Totes" },
      { href: "/products?category=backpack", label: "Backpacks" },
      { href: "/products?collection=heritage", label: "New" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/about#craft", label: "How we work" },
      { href: "/about#materials", label: "Materials" },
      { href: "/about#collection", label: "The collection" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help/shipping", label: "Shipping & returns" },
      { href: "/help/care", label: "Care guide" },
      { href: "/help/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  // Same env var powering the floating WhatsApp button — strip anything
  // that isn't a digit so `03..` / `+92 ..` / `92-300-..` all normalise.
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    ""
  );

  // Hide the footer inside admin (it has its own chrome) and on auth pages
  // so the sign-in / sign-up form is the only thing on screen.
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/auth")) return null;

  return (
    <footer className="border-t border-border bg-background">
      {/* ─── Newsletter CTA ─────────────────────────────────────────────
          Full-width hero band that ends the page on a conversion note
          before the standard footer chrome below. Gold-tinted gradient
          + ambient glows visually separate it from the plain footer
          content so it reads as "final invitation", not "boring nav".
          Sits INSIDE <footer> semantically so it's still part of the
          site footer landmark. */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-gold/12 via-background to-background dark:from-gold/8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        />

        <div className="container relative py-12 md:py-20">
          <div className="grid gap-8 md:gap-14 md:grid-cols-[1.1fr_1fr] md:items-center">
            {/* Copy — leads with a bigger display heading so it reads
                as a hero moment, not a form label. */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gold-dark dark:text-gold-light">
                The Newsletter
              </p>
              <h3 className="mt-3 font-display text-3xl sm:text-4xl md:text-[42px] leading-[1.1] tracking-tight">
                A quiet note when new pieces leave the studio.
              </h3>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">
                One letter a month. No marketing pressure — just the news
                of what's coming out of our Lahore workshop.
              </p>
            </div>

            {/* Form — enlarged input + button so it feels like a hero
                CTA, not the small tucked-away signup it was before. */}
            <div className="md:pl-4 lg:pl-8">
              <FooterNewsletter />
              <p className="mt-3 text-[11px] text-muted-foreground">
                Unsubscribe anytime · no fuss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Standard footer: brand + link grid ────────────────────── */}
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[1.1fr_1.6fr] lg:grid-cols-[1fr_1.4fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-display text-2xl">
              <span className="inline-block h-2 w-2 rounded-full bg-gold" />
              BagsArt
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Quietly designed leather goods, made in a small studio in
              Lahore.
            </p>

            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="hover:text-foreground transition"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Lahore, Pakistan</span>
              </li>
            </ul>

            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-muted hover:border-foreground/30 transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              {/* WhatsApp chip sits alongside the socials so shoppers who
                  already trust WhatsApp for local commerce can jump into
                  a chat without hunting for the floating button. Hidden
                  when the number env var isn't set so an unconfigured
                  deploy stays silent. */}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-muted hover:border-foreground/30 transition"
                >
                  <WhatsAppGlyph className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Link sections — 3 cols even on mobile so they sit beside each other */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {sections.map((s) => (
              <div key={s.title}>
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.title}
                </p>
                <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 text-sm">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-foreground/85 hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} BagsArt. All rights reserved.
          </span>
          <div className="flex gap-5">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/refunds">Refunds</Link>
            <Link href="/legal/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Inline WhatsApp brand glyph. Lucide doesn't ship a WhatsApp icon
 * (trademark reasons), and pulling in another icon package for one shape
 * isn't worth the bundle bytes — inline SVG keeps it fully local.
 */
function WhatsAppGlyph({ className }: { className?: string }) {
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
