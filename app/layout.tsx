import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { ToastViewport } from "@/components/ui/toast";

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
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "BagsArt — Crafted Bags, Reimagined",
    template: "%s · BagsArt",
  },
  description:
    "BagsArt is a premium leather atelier crafting bags, totes, and accessories with an obsessive focus on detail.",
  openGraph: {
    title: "BagsArt — Crafted Bags, Reimagined",
    description:
      "Premium leather goods, designed in studio and built to last.",
    type: "website",
    siteName: "BagsArt",
  },
  twitter: { card: "summary_large_image" },
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
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <ScrollToTop />
          <ToastViewport />
        </Providers>
      </body>
    </html>
  );
}
