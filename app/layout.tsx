import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { WishlistFab } from "@/components/layout/wishlist-fab";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { WishlistSync } from "@/components/layout/wishlist-sync";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ToastViewport } from "@/components/ui/toast";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Crafted Bags, Reimagined`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    "leather bags",
    "premium bags",
    "tote",
    "backpack",
    "leather goods",
    "Lahore",
    "BagsArt",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} — Crafted Bags, Reimagined`,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Crafted Bags, Reimagined`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icons are auto-discovered from `app/icon.svg` + `app/apple-icon.svg`
  // by Next.js — no explicit `icons:` block needed.
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: SUPPORT_EMAIL,
    contactType: "customer support",
    areaServed: "Worldwide",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable}`}
    >
      <head>
        {/* Speeds up the first image fetch by opening the TLS connection
            to Unsplash before the LCP image is parsed. dns-prefetch is a
            cheaper fallback for browsers that ignore preconnect. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Site-wide structured data — helps Google build the brand knowledge
            panel and enables sitelinks search box in the SERP. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Thin top progress bar that surfaces on route transitions —
            gives visual feedback the moment a link is clicked so the site
            never feels like it stalled. Gold to match the brand accent.
            initialPosition + slower crawl so the bar is genuinely visible
            on localhost where navigations finish in a single frame; on
            production the natural latency does most of the work. */}
        <NextTopLoader
          color="#C9A961"
          height={3}
          showSpinner={false}
          shadow="0 0 10px rgba(201,169,97,0.55), 0 0 5px rgba(201,169,97,0.6)"
          initialPosition={0.25}
          crawlSpeed={280}
          speed={400}
          easing="ease"
          zIndex={9999}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <WhatsAppFab />
          <WishlistFab />
          <ScrollToTop />
          <WishlistSync />
          <CartDrawer />
          <CookieBanner />
          <ToastViewport />
        </Providers>
      </body>
    </html>
  );
}
