import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Refund & return policy",
  description:
    "How cancellations, returns, and refunds work at BagsArt — timelines, fees, and what qualifies.",
};

export default function RefundsPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Refund & return policy"
      intro="Last updated 7 July 2026. We want you to love what you unbox — and if you don't, this page lays out exactly how cancellations, returns, and refunds work. Written to be clear, not clever."
    >
      <ProseSection id="overview" title="At a glance">
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
          <li>
            <strong>Cancel before dispatch</strong> — full refund within 24
            hours of ordering (online payments); a small gateway fee applies
            after that.
          </li>
          <li>
            <strong>Return after delivery</strong> — 7 days to request a
            return. Unused, tags on, original packaging.
          </li>
          <li>
            <strong>Damaged or wrong item</strong> — 100% covered by us,
            including return pickup.
          </li>
          <li>
            <strong>Change of mind</strong> — 90% refund; customer pays
            return shipping.
          </li>
          <li>
            <strong>Custom / monogrammed pieces</strong> — final sale, no
            returns.
          </li>
        </ul>
      </ProseSection>

      <ProseSection id="cancellation" title="1. Cancelling an order (before dispatch)">
        <p>
          You can cancel any order from your{" "}
          <a
            href="/dashboard/orders"
            className="underline decoration-gold underline-offset-4"
          >
            orders page
          </a>{" "}
          as long as it hasn't been dispatched. What you get back depends on
          how you paid and how quickly you cancel.
        </p>
        <table className="w-full text-sm mt-3 border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Payment</th>
              <th className="text-left px-3 py-2 font-medium">Timing</th>
              <th className="text-left px-3 py-2 font-medium">Refund</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-3 py-2">Cash on delivery</td>
              <td className="px-3 py-2">Anytime before dispatch</td>
              <td className="px-3 py-2">No charge</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Card / online</td>
              <td className="px-3 py-2">Within 24 hours of order</td>
              <td className="px-3 py-2">
                <strong>100%</strong>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Card / online</td>
              <td className="px-3 py-2">After 24 hours, before dispatch</td>
              <td className="px-3 py-2">
                <strong>95%</strong> — 5% payment gateway fee
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Card / online</td>
              <td className="px-3 py-2">After dispatch</td>
              <td className="px-3 py-2">See return policy below</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-muted-foreground mt-3">
          The 5% fee reflects what our payment processor charges us on the
          original transaction — that portion doesn't come back to us when we
          refund, so we can't refund it to you.
        </p>
      </ProseSection>

      <ProseSection id="returns" title="2. Returning a delivered order">
        <p>
          You have <strong>7 days from the delivery date</strong> to request a
          return. To start one, email{" "}
          <a
            href="mailto:bags.art.pk@gmail.com"
            className="underline decoration-gold underline-offset-4"
          >
            bags.art.pk@gmail.com
          </a>{" "}
          with your order number and reason, or WhatsApp us the same. We'll
          reply with the return address and pickup instructions.
        </p>
        <table className="w-full text-sm mt-3 border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Reason</th>
              <th className="text-left px-3 py-2 font-medium">Shipping</th>
              <th className="text-left px-3 py-2 font-medium">Refund</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-3 py-2">Damaged / defective on arrival</td>
              <td className="px-3 py-2">Free — we arrange pickup</td>
              <td className="px-3 py-2">
                <strong>100%</strong> or free replacement
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Wrong item / wrong colour sent</td>
              <td className="px-3 py-2">Free — we arrange pickup</td>
              <td className="px-3 py-2">
                <strong>100%</strong> or free replacement
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Size or fit not right</td>
              <td className="px-3 py-2">Customer bears (Rs 250–400)</td>
              <td className="px-3 py-2">
                <strong>90%</strong> — 10% restocking fee
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Change of mind</td>
              <td className="px-3 py-2">Customer bears (Rs 250–400)</td>
              <td className="px-3 py-2">
                <strong>90%</strong> — 10% restocking fee
              </td>
            </tr>
          </tbody>
        </table>
      </ProseSection>

      <ProseSection id="condition" title="3. Condition the bag must be in">
        <p>
          To qualify for a return, the piece must arrive back to us:
        </p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 text-muted-foreground">
          <li>Unused, unwashed, with no signs of wear</li>
          <li>All original tags still attached</li>
          <li>Original packaging — dust bag, box, and inserts</li>
        </ul>
        <p className="mt-3">
          If the bag arrives back with visible use — scuffs, scent of perfume,
          missing tags — we'll photograph it and either refuse the return or
          apply an additional deduction, at our discretion. We'll always tell
          you what we found before deciding.
        </p>
      </ProseSection>

      <ProseSection id="damage-reporting" title="4. Reporting damage or a wrong item">
        <p>
          For anything that's our fault — damaged, defective, or the wrong
          item — we need photos <strong>within 48 hours of delivery</strong>.
          Send them by email or WhatsApp with your order number. This short
          window is what lets us credibly claim compensation from the courier
          and stop these cases from turning into disputes.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          After 48 hours, damage claims fall under the standard 7-day return
          window (change-of-mind terms), because we can no longer prove it
          happened in transit.
        </p>
      </ProseSection>

      <ProseSection id="non-returnable" title="5. What we can't take back">
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
          <li>Custom or monogrammed pieces (name, initials, engraving)</li>
          <li>Items from clearance / final-sale collections (marked clearly)</li>
          <li>Bags with tags cut off or clear signs of use</li>
          <li>Gift cards</li>
        </ul>
      </ProseSection>

      <ProseSection id="refund-timeline" title="6. When the money reaches you">
        <p>
          Once we receive and inspect the returned bag (typically 1–2
          business days after it lands at the studio), we release the refund.
          How long it then takes to appear depends on your payment method:
        </p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 text-muted-foreground">
          <li>
            <strong>Card / online payments</strong> — 5–7 business days back
            to the original card or wallet. Some banks take longer to post
            it, but we've released it on our end.
          </li>
          <li>
            <strong>Cash on delivery</strong> — bank transfer within 3–5
            business days after inspection. We'll ask for your IBAN and the
            account holder's name. We don't do cash refunds.
          </li>
        </ul>
      </ProseSection>

      <ProseSection id="exchange" title="7. Exchanges">
        <p>
          Prefer a different size or colour? We can exchange within the same
          7-day return window, subject to stock. If the swap is because of
          something on our end (wrong item sent, size mismatch on a fit chart
          we published), the exchange is free. If it's a change of preference,
          you cover the return shipping and we cover the outbound shipping on
          the replacement.
        </p>
      </ProseSection>

      <ProseSection id="questions" title="Questions">
        <p>
          Anything unclear, or a case that doesn't fit the tables above? Email{" "}
          <a
            href="mailto:bags.art.pk@gmail.com"
            className="underline decoration-gold underline-offset-4"
          >
            bags.art.pk@gmail.com
          </a>
          . We read every message ourselves and reply within one business day.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
