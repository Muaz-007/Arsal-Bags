import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "How we ship from our Karachi studio, lead times by region, and our 30-day return policy.",
};

export default function ShippingPage() {
  return (
    <ProsePage
      eyebrow="Help"
      title="Shipping & returns"
      intro="Every piece is finished by hand and shipped from our Karachi atelier. Here's what to expect after you place an order."
    >
      <ProseSection id="lead-times" title="Lead times">
        <p>
          Orders placed before 4&nbsp;PM PKT are dispatched the next business
          day. Pieces marked <em>Made to order</em> require an additional 3–5
          days in the workshop before shipping.
        </p>
        <ul className="list-disc list-inside space-y-1.5 mt-3 text-muted-foreground">
          <li>Pakistan — 2–4 business days · standard</li>
          <li>South Asia, Middle East — 5–8 business days · DHL Express</li>
          <li>Europe, North America — 6–10 business days · DHL Express</li>
          <li>Everywhere else — 8–14 business days · DHL Express</li>
        </ul>
      </ProseSection>

      <ProseSection id="costs" title="Costs">
        <p>
          Domestic shipping is a flat <strong>PKR 500</strong>. International
          DHL is <strong>$15</strong> per order, free over <strong>$250</strong>.
          Duties and import taxes are collected by the carrier on delivery and
          are not included in your order total.
        </p>
      </ProseSection>

      <ProseSection id="tracking" title="Tracking">
        <p>
          You'll receive a tracking link by email the moment your order leaves
          the studio. Signed-in customers can also track every order from{" "}
          <a href="/dashboard" className="underline decoration-gold underline-offset-4">
            their account page
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="returns" title="Returns">
        <p>
          Pieces can be returned within <strong>30 days</strong> of delivery,
          unused, in their original packaging. Made-to-order and monogrammed
          items are final sale.
        </p>
        <p>
          Email{" "}
          <a
            href="mailto:returns@bagsart.dev"
            className="underline decoration-gold underline-offset-4"
          >
            returns@bagsart.dev
          </a>{" "}
          with your order number to start a return. We'll send a prepaid label
          (domestic) or instructions (international).
        </p>
      </ProseSection>

      <ProseSection id="repairs" title="Lifetime repair">
        <p>
          Stitching come loose? Hardware tarnished? We'll repair any BagsArt
          piece for the lifetime of the bag — you cover shipping, we cover the
          rest. See the{" "}
          <a
            href="/help/care"
            className="underline decoration-gold underline-offset-4"
          >
            care guide
          </a>{" "}
          for prevention.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
