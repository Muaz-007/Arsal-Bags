/**
 * BagsArt email templates.
 *
 * Every template returns BOTH a plain-text version (for clients that strip
 * HTML / accessibility) and a fully inline-styled HTML version (for
 * everything else). All styling is inline because Gmail, Outlook, and most
 * other clients strip <style> tags. We avoid external resources too —
 * no remote CSS, no JS, no web fonts that won't load — so the design is
 * resilient across Gmail, Outlook, Apple Mail, mobile clients.
 *
 * Layout: 600px max-width centered card on a soft gradient background,
 * with a thin gold rule under the brand mark and a friendly tone.
 */

const GOLD = "#C9A961";
const GOLD_DARK = "#8C7233";
const TEXT = "#0b0b0c";
const TEXT_MUTED = "#71717a";
const BG = "#f7f5f0";
const CARD = "#ffffff";
const BORDER = "#e8e2d6";

const BASE_URL =
  process.env.NEXTAUTH_URL ?? "https://bagsart.vercel.app";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface ShellOptions {
  preheader?: string; // hidden preview text shown in the inbox list
  title: string;
  bodyHtml: string;
}

/**
 * Outer email shell. Renders a soft gradient backdrop, a centered card with
 * the BagsArt brand mark up top, the content block, and a small footer.
 */
function shell({ preheader, title, bodyHtml }: ShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};line-height:1.55;-webkit-font-smoothing:antialiased;">

  ${preheader ? `<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(preheader)}</div>` : ""}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG};padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Brand mark -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;margin:0 auto 16px;">
          <tr>
            <td align="center" style="padding:8px 0 16px;">
              <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:${GOLD};margin-right:8px;"></span>
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;letter-spacing:-0.2px;color:${TEXT};vertical-align:middle;">BagsArt</span>
            </td>
          </tr>
        </table>

        <!-- Main card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${CARD};border:1px solid ${BORDER};border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgba(11,11,12,0.04);">

          <!-- Gold accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${GOLD} 0%,${GOLD_DARK} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:40px 44px 44px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;margin-top:24px;">
          <tr>
            <td align="center" style="padding:8px 16px;font-size:11px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:1.6px;">
              Atelier · Lahore
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 16px 8px;font-size:12px;color:${TEXT_MUTED};">
              <a href="${BASE_URL}" style="color:${TEXT_MUTED};text-decoration:none;">bagsart.dev</a>
              &nbsp;·&nbsp;
              <a href="mailto:bags.art.pk@gmail.com" style="color:${TEXT_MUTED};text-decoration:none;">bags.art.pk@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}/help/faq" style="color:${TEXT_MUTED};text-decoration:none;">help</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 16px 0;font-size:11px;color:${TEXT_MUTED};">
              © ${new Date().getFullYear()} BagsArt Atelier. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable gold button. */
function ctaButton(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;">
    <tr>
      <td align="center" style="border-radius:10px;background:${GOLD};">
        <a href="${escape(href)}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:${TEXT};text-decoration:none;border-radius:10px;letter-spacing:0.2px;">${escape(label)}</a>
      </td>
    </tr>
  </table>`;
}

/* ─── Welcome ─────────────────────────────────────────────────────────── */

export function welcomeTemplate(name: string): { html: string; text: string } {
  const firstName = name.split(" ")[0];

  const html = shell({
    preheader: `Welcome to the BagsArt atelier, ${firstName}.`,
    title: "Welcome to BagsArt",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">A note from the atelier</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Welcome, <span style="color:${GOLD_DARK};">${escape(firstName)}</span>.
      </h1>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Glad to have you with us. BagsArt is a small studio making leather bags the slow way — one piece, one artisan, one signature inside.
      </p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Your account is set up. From here, you can track orders, save favorites to your wishlist, and check out faster on any device.
      </p>
      ${ctaButton(`${BASE_URL}/products`, "Browse the collection →")}
      <p style="margin:24px 0 0;font-size:13px;color:${TEXT_MUTED};">
        Have a question? Just reply to this email — we read every message ourselves.
      </p>
      <p style="margin:20px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Welcome to BagsArt

Hi ${firstName},

Glad to have you with us. BagsArt is a small studio making leather bags the slow way — one piece, one artisan, one signature inside.

Your account is set up. You can track orders, save favorites to your wishlist, and check out faster on any device.

Browse the collection: ${BASE_URL}/products

Have a question? Just reply to this email.

— The BagsArt team`;

  return { html, text };
}

/* ─── Order confirmation ──────────────────────────────────────────────── */

export function orderConfirmationTemplate(order: {
  id: string;
  customerName: string;
  total: number;
  items: { name: string; quantity: number }[];
}): { html: string; text: string } {
  const firstName = order.customerName.split(" ")[0];

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT};">
          <span style="display:inline-block;min-width:32px;color:${TEXT_MUTED};">${i.quantity}×</span>
          ${escape(i.name)}
        </td>
      </tr>`
    )
    .join("");

  const html = shell({
    preheader: `Order ${order.id} confirmed · $${order.total.toFixed(2)}`,
    title: "Order confirmed",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Order confirmed</p>
      <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Thank you, ${escape(firstName)}.
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:${TEXT_MUTED};">
        Your order is in the workshop queue. You'll get another note when it ships.
      </p>

      <!-- Order meta row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Order</p>
            <p style="margin:2px 0 0;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:13px;color:${TEXT};">${escape(order.id)}</p>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Items</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
        ${itemRows}
      </table>

      <!-- Total -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        <tr>
          <td style="font-size:14px;color:${TEXT_MUTED};">Total</td>
          <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:${TEXT};">$${order.total.toFixed(2)}</td>
        </tr>
      </table>

      ${ctaButton(`${BASE_URL}/dashboard/orders/${order.id}`, "Track your order")}

      <p style="margin:28px 0 0;font-size:13px;color:${TEXT_MUTED};">
        Need to change something? Reply to this email and we'll sort it out — as long as the order hasn't shipped.
      </p>
      <p style="margin:18px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Order confirmed · ${order.id}

Hi ${firstName},

Thank you for ordering from BagsArt.

Items:
${order.items.map((i) => `· ${i.quantity}× ${i.name}`).join("\n")}

Total: $${order.total.toFixed(2)}

Track your order: ${BASE_URL}/dashboard/orders/${order.id}

Need to change something? Reply to this email — as long as it hasn't shipped yet.

— The BagsArt team`;

  return { html, text };
}

/* ─── Email change verification ───────────────────────────────────────── */

export function emailChangeTemplate(link: string): { html: string; text: string } {
  const html = shell({
    preheader: "Confirm your new BagsArt email address — link expires in 1 hour.",
    title: "Confirm your new email",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Account security</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Confirm your new email.
      </h1>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Someone (hopefully you) asked to switch the BagsArt account email to this address.
      </p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Click the button below within <strong>one hour</strong> to confirm. Until you click, the account stays on the old email.
      </p>

      ${ctaButton(link, "Confirm new email")}

      <p style="margin:24px 0 8px;font-size:13px;color:${TEXT_MUTED};">
        If the button doesn't work, copy and paste this URL into your browser:
      </p>
      <p style="margin:0 0 14px;padding:10px 14px;background:#f9f6ef;border:1px solid ${BORDER};border-radius:8px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:12px;color:${TEXT};word-break:break-all;">
        ${escape(link)}
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;background:#fff8eb;border-left:3px solid ${GOLD};border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${TEXT};">
            <strong style="color:${GOLD_DARK};">Wasn't you?</strong> You can safely ignore this email — nothing changes on the account.
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Confirm your new BagsArt email

Someone asked to switch the BagsArt account email to this address.

If it was you, click the link below within one hour to confirm. Until you click, the account stays on the old email.

${link}

If it wasn't you, you can safely ignore this email.

— The BagsArt team`;

  return { html, text };
}

/* ─── Password reset ──────────────────────────────────────────────────── */

export function passwordResetTemplate(link: string): { html: string; text: string } {
  const html = shell({
    preheader: "Reset your BagsArt password — link expires in 1 hour.",
    title: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Account security</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Reset your password.
      </h1>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Someone (hopefully you) asked to reset the password on your BagsArt account.
      </p>
      <p style="margin:0 0 14px;font-size:15px;color:${TEXT};">
        Click the button below to choose a new one. The link expires in <strong>one hour</strong>.
      </p>

      ${ctaButton(link, "Reset password")}

      <p style="margin:24px 0 8px;font-size:13px;color:${TEXT_MUTED};">
        If the button doesn't work, copy and paste this URL into your browser:
      </p>
      <p style="margin:0 0 14px;padding:10px 14px;background:#f9f6ef;border:1px solid ${BORDER};border-radius:8px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:12px;color:${TEXT};word-break:break-all;">
        ${escape(link)}
      </p>

      <!-- Security note -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;background:#fff8eb;border-left:3px solid ${GOLD};border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${TEXT};">
            <strong style="color:${GOLD_DARK};">Wasn't you?</strong> You can safely ignore this email — nothing has changed on your account.
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Reset your BagsArt password

Someone asked to reset the password on your BagsArt account.

If it was you, click the link below to choose a new one. The link expires in one hour.

${link}

If it wasn't you, you can safely ignore this email — nothing has changed.

— The BagsArt team`;

  return { html, text };
}
