import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions we hear most about BagsArt orders, materials, and the workshop.",
};

const QA = [
  {
    q: "Where are your bags made?",
    a: "Cut and stitched in our Karachi studio. The leather is tanned in Tuscany; brass hardware is cast in Birmingham.",
  },
  {
    q: "Is the leather full-grain?",
    a: "Yes — every BagsArt piece uses Tuscan full-grain leather. We never use bonded, split, or coated leathers.",
  },
  {
    q: "How long will my bag last?",
    a: "Full-grain leather pieces typically last 15–30 years of regular use, and look better the older they get. Our lifetime repair guarantee means we'll fix worn stitching or hardware indefinitely.",
  },
  {
    q: "Can I monogram a bag?",
    a: "We offer hot-foil monogramming (gold, silver, or blind-press) on most pieces. Add it from the product page — it adds 3 days to the lead time and is final sale.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa, Mastercard, and American Express through Stripe. Apple Pay and Google Pay are supported on compatible devices. Bank transfer is available for orders over $1,000 — email us.",
  },
  {
    q: "Do you offer wholesale?",
    a: "Yes, for select multi-brand stores. Reach us at wholesale@bagsart.dev.",
  },
  {
    q: "I forgot to add the discount code — can you apply it?",
    a: "If your order hasn't shipped yet, reply to your confirmation email and we'll refund the difference.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, until it ships. After that, please follow the returns process. Made-to-order pieces can be cancelled within 24 hours of placement.",
  },
];

export default function FaqPage() {
  return (
    <ProsePage
      eyebrow="Help"
      title="Frequently asked"
      intro="If your question isn't here, email us at hello@bagsart.dev — we read every message ourselves."
    >
      <div className="divide-y divide-border">
        {QA.map((item) => (
          <details
            key={item.q}
            className="group py-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-display text-lg pr-4">{item.q}</span>
              <span className="text-muted-foreground text-2xl leading-none group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-foreground/85 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </ProsePage>
  );
}
