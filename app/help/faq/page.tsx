import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions we hear most about BagsArt orders, materials, and the workshop.",
};

const QA = [
  {
    q: "Where are your bags made?",
    a: "Designed, cut, and stitched in our Lahore studio. Each piece is finished by one maker rather than assembled on a line.",
  },
  {
    q: "Is the leather full-grain?",
    a: "Yes. Every BagsArt piece is built from full-grain leather — the top layer of the hide, with the grain intact. We don't use bonded, split, or coated leather.",
  },
  {
    q: "How long will my bag last?",
    a: "Well-kept full-grain leather often ages beautifully — softening, deepening in color, and picking up a natural patina over years of use. Follow the care guide and it should stay a piece you actually want to keep carrying.",
  },
  {
    q: "Can I monogram a bag?",
    a: "Yes — we offer initials on most pieces (blind-press or gold foil). Add it from the product page. Monogrammed pieces add a few days to the lead time and are final sale.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major debit and credit cards. For larger orders or anything custom, get in touch and we'll arrange a bank transfer.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship worldwide via DHL Express. See the shipping & returns page for current rates and lead times.",
  },
  {
    q: "I forgot to add the discount code — can you apply it?",
    a: "If your order hasn't shipped yet, reply to your confirmation email and we'll refund the difference.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, anytime before it ships. After that, please follow the returns process. Made-to-order pieces can be cancelled within 24 hours of placement.",
  },
];

export default function FaqPage() {
  return (
    <ProsePage
      eyebrow="Help"
      title="Frequently asked"
      intro="If your question isn't here, email us at bags.art.pk@gmail.com — we read every message ourselves."
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
