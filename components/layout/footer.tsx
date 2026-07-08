"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { FooterNewsletter } from "./footer-newsletter";

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
  // Hide the footer inside admin (it has its own chrome) and on auth pages
  // so the sign-in / sign-up form is the only thing on screen.
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/auth")) return null;

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12 md:py-16">
        {/* Top: brand block + link grid side by side */}
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
                  href="mailto:bags.art.pk@gmail.com"
                  className="hover:text-foreground transition"
                >
                  bags.art.pk@gmail.com
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
            </div>

            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Newsletter
              </p>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                One quiet note a month when new pieces leave the studio.
              </p>
              <FooterNewsletter />
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
