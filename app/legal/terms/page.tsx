import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The agreement between you and BagsArt when you use the store.",
};

export default function TermsPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Terms of service"
      intro="Last updated 25 June 2026. By using bagsart.dev you agree to these terms. They're written to be readable — if anything is unclear, email hello@bagsart.dev."
    >
      <ProseSection id="account" title="Your account">
        <p>
          You must be 18+ to place an order. Keep your password safe — you're
          responsible for activity under your account. We'll never email you
          asking for it.
        </p>
      </ProseSection>

      <ProseSection id="orders" title="Orders">
        <p>
          Order confirmation isn't acceptance — we may decline an order if a
          product is mis-priced, out of stock, or appears fraudulent. In that
          case, we'll cancel and refund within 3 business days.
        </p>
      </ProseSection>

      <ProseSection id="pricing" title="Pricing &amp; currency">
        <p>
          All prices are in USD unless noted. Pakistani customers are billed in
          PKR at the day's interbank rate. Import duties and taxes are
          collected on delivery by the carrier and are not part of the order
          total.
        </p>
      </ProseSection>

      <ProseSection id="returns" title="Returns &amp; refunds">
        <p>
          Standard pieces are returnable within 30 days. Made-to-order and
          monogrammed pieces are final sale. Full policy is on the{" "}
          <a
            href="/help/shipping"
            className="underline decoration-gold underline-offset-4"
          >
            shipping &amp; returns page
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="ip" title="Intellectual property">
        <p>
          The BagsArt name, logo, photography, and product designs are owned by
          BagsArt Atelier and may not be used without written permission.
        </p>
      </ProseSection>

      <ProseSection id="liability" title="Liability">
        <p>
          To the extent the law allows, BagsArt's liability for any order is
          limited to the amount you paid for it. Nothing in these terms limits
          liability for fraud, willful misconduct, or anything else
          non-waivable.
        </p>
      </ProseSection>

      <ProseSection id="governing-law" title="Governing law">
        <p>
          These terms are governed by the laws of Pakistan. For EU residents,
          your local consumer protection laws also apply where they grant
          stronger rights.
        </p>
      </ProseSection>

      <ProseSection id="changes" title="Changes">
        <p>
          We may update these terms — we'll post a notice on the site for any
          material change. Continued use after the change means you accept the
          updated terms.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
