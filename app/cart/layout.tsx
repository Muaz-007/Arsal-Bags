import type { Metadata } from "next";

// Cart is user-specific and gated — keep it out of the index.
export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your bag before checkout.",
  robots: { index: false, follow: false },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
