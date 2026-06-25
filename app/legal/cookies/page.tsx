import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "What cookies bagsart.dev uses, why, and how to control them.",
};

export default function CookiesPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Cookie policy"
      intro="Last updated 25 June 2026. Cookies let our site remember you between visits. We use the fewest we can — here's the full list."
    >
      <ProseSection id="necessary" title="Strictly necessary">
        <p>These keep the site working. You can't opt out of them.</p>
        <table className="w-full text-sm mt-3 border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">Purpose</th>
              <th className="text-left px-3 py-2 font-medium">Lifetime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-3 py-2 font-mono text-xs">next-auth.*</td>
              <td className="px-3 py-2">Keeps you signed in</td>
              <td className="px-3 py-2">30 days</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-mono text-xs">bagsart-cart</td>
              <td className="px-3 py-2">Remembers your cart</td>
              <td className="px-3 py-2">30 days</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-mono text-xs">theme</td>
              <td className="px-3 py-2">Light / dark preference</td>
              <td className="px-3 py-2">1 year</td>
            </tr>
          </tbody>
        </table>
      </ProseSection>

      <ProseSection id="analytics" title="Analytics (optional)">
        <p>
          If you accept the analytics cookie, we use it to measure aggregate
          traffic patterns — no personal identification. You can decline this
          at any time from{" "}
          <a
            href="/dashboard/profile"
            className="underline decoration-gold underline-offset-4"
          >
            your profile
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="third-party" title="Third-party cookies">
        <p>
          Stripe sets a cookie when you check out (fraud prevention). It does
          not run on any other page. See{" "}
          <a
            href="https://stripe.com/cookie-settings"
            rel="nofollow"
            className="underline decoration-gold underline-offset-4"
          >
            Stripe's cookie settings
          </a>{" "}
          for details.
        </p>
      </ProseSection>

      <ProseSection id="manage" title="Managing cookies">
        <p>
          Every modern browser lets you block or delete cookies. Doing so will
          sign you out and clear your cart, but the site will keep working.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
