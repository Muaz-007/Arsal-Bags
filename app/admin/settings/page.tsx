import Link from "next/link";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

/**
 * `/admin/settings` — status + configuration read-outs.
 *
 * The store name and support email intentionally aren't editable from
 * here. Both are baked into `lib/site.ts` (and pulled into JSON-LD,
 * every email template, legal pages, and metadata) at module load, so
 * they need a code change + redeploy to update. Faking an editable
 * form here would silently drop admin changes — worse UX than being
 * honest that this is a status page.
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store configuration and integration status.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Store identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Store name</span>
            <span className="font-medium">{SITE_NAME}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Support email</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium hover:underline decoration-gold underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              These values live in <code className="font-mono text-foreground">lib/site.ts</code>{" "}
              and flow through JSON-LD, email templates, and legal pages.
              To change them, edit the file and redeploy.
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2.5">
          <IntegrationRow
            name="Database (Postgres)"
            connected={!!process.env.DATABASE_URL}
            unset="mock data mode"
          />
          <IntegrationRow
            name="Email (Resend SMTP)"
            connected={
              !!process.env.SMTP_HOST &&
              process.env.SMTP_HOST.includes("resend")
            }
            unset="not configured — set SMTP_* env vars"
          />
          <IntegrationRow
            name="Cloudinary"
            connected={!!process.env.CLOUDINARY_CLOUD_NAME}
            unset="not configured — image uploads disabled"
          />
          <IntegrationRow
            name="Google OAuth"
            connected={!!process.env.GOOGLE_CLIENT_ID}
            unset='not configured — "Continue with Google" hidden'
          />
          <IntegrationRow
            name="Stripe"
            connected={!!process.env.STRIPE_SECRET_KEY}
            unset="not configured — card payments disabled"
          />
          <IntegrationRow
            name="WhatsApp (public)"
            connected={!!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
            unset="not configured — floating chat button hidden"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where to configure</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>
            <strong className="text-foreground">Storefront sections</strong>{" "}
            (hero, category strip, featured rails) — edit from{" "}
            <Link
              href="/admin/storefront"
              className="text-foreground underline decoration-gold underline-offset-4"
            >
              /admin/storefront
            </Link>
            .
          </p>
          <p>
            <strong className="text-foreground">Products, coupons, orders</strong>{" "}
            — their own admin pages in the sidebar.
          </p>
          <p>
            <strong className="text-foreground">Integration keys</strong> —
            set env vars on Vercel (Project → Settings → Environment
            Variables), then redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationRow({
  name,
  connected,
  unset,
}: {
  name: string;
  connected: boolean;
  unset: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 last:border-0 pb-2 last:pb-0">
      <span className="text-foreground">{name}</span>
      {connected ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      ) : (
        <span className="text-xs text-muted-foreground text-right">{unset}</span>
      )}
    </div>
  );
}
