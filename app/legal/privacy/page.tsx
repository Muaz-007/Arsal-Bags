import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How BagsArt collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Privacy policy"
      intro="Last updated 25 June 2026. This is a plain-language summary of how we handle your data. Where local law gives you more rights than what's described here, those rights apply."
    >
      <ProseSection id="what-we-collect" title="What we collect">
        <p>When you shop or sign up, we collect:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 text-muted-foreground">
          <li>Account details — name, email, hashed password</li>
          <li>Order details — shipping address, items, totals</li>
          <li>Payment confirmation — handled by Stripe; we never see card numbers</li>
          <li>Browser data — anonymized analytics for site improvements</li>
        </ul>
      </ProseSection>

      <ProseSection id="why" title="Why we collect it">
        <p>
          To process orders, send shipping updates, prevent fraud, and improve
          the store. We don't sell or rent your data to anyone. Ever.
        </p>
      </ProseSection>

      <ProseSection id="cookies" title="Cookies">
        <p>
          We use a small set of strictly necessary cookies for authentication
          and cart persistence, plus optional analytics. See our{" "}
          <a
            href="/legal/cookies"
            className="underline decoration-gold underline-offset-4"
          >
            cookie policy
          </a>{" "}
          for details.
        </p>
      </ProseSection>

      <ProseSection id="retention" title="How long we keep it">
        <p>
          Order records are kept for 7 years for tax and accounting compliance.
          You can request deletion of your account and we'll anonymize
          everything else within 30 days.
        </p>
      </ProseSection>

      <ProseSection id="your-rights" title="Your rights">
        <p>
          You can access, correct, export, or delete your data at any time from{" "}
          <a
            href="/dashboard/profile"
            className="underline decoration-gold underline-offset-4"
          >
            your profile
          </a>
          , or email{" "}
          <a
            href="mailto:hello@bagsart.store"
            className="underline decoration-gold underline-offset-4"
          >
            hello@bagsart.store
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="contact" title="Contact">
        <p>
          BagsArt · Lahore, Pakistan · hello@bagsart.store.
          For data-protection requests, use the same address.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
