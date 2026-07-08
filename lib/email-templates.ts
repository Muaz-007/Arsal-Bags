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

        <!-- Follow / help row — appears between the card and legal footer
             so every email includes a small human touchpoint without
             cluttering the card content itself. -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;margin:20px auto 8px;">
          <tr>
            <td align="center" style="padding:16px 16px 8px;font-size:11px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:2px;">
              Made in Lahore · Shipped worldwide
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 16px 8px;">
              <a href="https://www.instagram.com/bags_art_official/" style="display:inline-block;padding:6px 14px;margin:0 4px;font-size:12px;color:${TEXT_MUTED};text-decoration:none;border:1px solid ${BORDER};border-radius:999px;background:${CARD};">Instagram</a>
              <a href="https://www.facebook.com/share/14gt9w5emgu/" style="display:inline-block;padding:6px 14px;margin:0 4px;font-size:12px;color:${TEXT_MUTED};text-decoration:none;border:1px solid ${BORDER};border-radius:999px;background:${CARD};">Facebook</a>
              <a href="${BASE_URL}/help/faq" style="display:inline-block;padding:6px 14px;margin:0 4px;font-size:12px;color:${TEXT_MUTED};text-decoration:none;border:1px solid ${BORDER};border-radius:999px;background:${CARD};">Help</a>
            </td>
          </tr>
        </table>

        <!-- Legal footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;margin-top:12px;">
          <tr>
            <td align="center" style="padding:8px 16px;font-size:12px;color:${TEXT_MUTED};line-height:1.6;">
              <a href="${BASE_URL}" style="color:${TEXT_MUTED};text-decoration:none;">bagsart</a>
              &nbsp;·&nbsp;
              <a href="mailto:bags.art.pk@gmail.com" style="color:${TEXT_MUTED};text-decoration:none;">bags.art.pk@gmail.com</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:2px 16px 0;font-size:11px;color:${TEXT_MUTED};line-height:1.6;">
              © ${new Date().getFullYear()} BagsArt · Lahore, Pakistan · All rights reserved.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:4px 16px 0;font-size:10px;color:${TEXT_MUTED};line-height:1.6;letter-spacing:0.2px;">
              You're getting this because you have a BagsArt account or placed an order with us.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable gold button. Includes a subtle bottom border darker gold so
 *  the pill has a bit of visual weight in clients that render CSS.
 *  A `background-image` fallback gradient adds depth in modern clients
 *  while keeping a solid gold background for legacy renderers.
 */
function ctaButton(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 4px;">
    <tr>
      <td align="center" style="border-radius:12px;background:${GOLD};background-image:linear-gradient(180deg,${GOLD} 0%,${GOLD_DARK} 100%);border-bottom:2px solid ${GOLD_DARK};">
        <a href="${escape(href)}" style="display:inline-block;padding:15px 32px;font-size:14px;font-weight:700;color:${TEXT};text-decoration:none;border-radius:12px;letter-spacing:0.4px;">${escape(label)}</a>
      </td>
    </tr>
  </table>`;
}

/* ─── Welcome ─────────────────────────────────────────────────────────── */

export function welcomeTemplate(name: string): { html: string; text: string } {
  const firstName = name.split(" ")[0];

  const html = shell({
    preheader: `Welcome to BagsArt, ${firstName} — glad to have you with us.`,
    title: "Welcome to BagsArt",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">A note from BagsArt</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:${TEXT};font-weight:600;letter-spacing:-0.5px;">
        Welcome, <span style="color:${GOLD_DARK};">${escape(firstName)}</span>.
      </h1>
      <p style="margin:0 0 16px;font-size:16px;color:${TEXT};line-height:1.6;">
        We're a small leather goods studio in Lahore, and we're really glad you're here. Every BagsArt piece starts with full-grain leather and gets a full quality check before it ships — no bag leaves the studio unless we'd carry it ourselves.
      </p>
      <p style="margin:0 0 20px;font-size:16px;color:${TEXT};line-height:1.6;">
        Your account is ready. You can track orders, save favourites to your wishlist, and check out in a couple of taps next time.
      </p>

      ${ctaButton(`${BASE_URL}/products`, "Browse the collection →")}

      <!-- Small "what's included" band under the CTA -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 0;background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Every BagsArt order</p>
            <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.7;">
              · Full-grain leather, checked piece by piece<br />
              · Free delivery on orders over Rs 4,000<br />
              · Cash on delivery available across Pakistan
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:26px 0 0;font-size:14px;color:${TEXT_MUTED};line-height:1.55;">
        Have a question or a request? Just reply to this email — a real person on our end reads every message.
      </p>
      <p style="margin:18px 0 0;font-size:15px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Welcome to BagsArt

Hi ${firstName},

Glad to have you with us. BagsArt is a small studio making leather bags the careful way — full-grain leather, quality-checked before every piece ships.

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

  const formattedTotal = `Rs ${Math.round(order.total).toLocaleString("en-PK")}`;

  const html = shell({
    preheader: `Order ${order.id} confirmed · ${formattedTotal}`,
    title: "Order confirmed",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Order confirmed</p>
      <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:${TEXT};font-weight:600;letter-spacing:-0.5px;">
        Thank you, ${escape(firstName)}.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:${TEXT};line-height:1.55;">
        We got your order. It's queued for a final quality check before it ships — we'll send another note the moment it's on its way to you.
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
          <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:${TEXT};">${formattedTotal}</td>
        </tr>
      </table>

      ${ctaButton(`${BASE_URL}/dashboard/orders/${order.id}`, "Track your order")}

      <!-- What happens next timeline -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 0;background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">What happens next</p>
            <p style="margin:0 0 6px;font-size:14px;color:${TEXT};line-height:1.6;">
              <span style="display:inline-block;color:${GOLD};margin-right:8px;">●</span>
              Quality check + packing at our Lahore studio
            </p>
            <p style="margin:0 0 6px;font-size:14px;color:${TEXT};line-height:1.6;">
              <span style="display:inline-block;color:${GOLD};margin-right:8px;">●</span>
              Handed to the courier — you'll get a tracking number by email
            </p>
            <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.6;">
              <span style="display:inline-block;color:${GOLD};margin-right:8px;">●</span>
              Pay the courier on delivery — cash on delivery, no online charge
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:24px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.55;">
        Need to change something? Reply to this email — as long as the order hasn't shipped, we can adjust it. After that, we'll help sort a return or an exchange.
      </p>
      <p style="margin:18px 0 0;font-size:15px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Order confirmed · ${order.id}

Hi ${firstName},

Thank you for ordering from BagsArt.

Items:
${order.items.map((i) => `· ${i.quantity}× ${i.name}`).join("\n")}

Total: ${formattedTotal}

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

/* ─── Order cancelled — customer copy ─────────────────────────────────── */

export function orderCancelledCustomerTemplate(order: {
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
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT};">
          <span style="display:inline-block;min-width:32px;color:${TEXT_MUTED};">${i.quantity}×</span>
          ${escape(i.name)}
        </td>
      </tr>`
    )
    .join("");

  const formattedTotal = `Rs ${Math.round(order.total).toLocaleString("en-PK")}`;

  const html = shell({
    preheader: `Order ${order.id} cancelled — nothing further needed on your side.`,
    title: "Order cancelled",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Order cancelled</p>
      <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        We've cancelled your order, ${escape(firstName)}.
      </h1>
      <p style="margin:0 0 22px;font-size:15px;color:${TEXT};line-height:1.55;">
        Nothing further is needed on your side. Because this order hadn't shipped yet, there was nothing to charge you — you owe us nothing.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Cancelled order</p>
            <p style="margin:2px 0 0;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:13px;color:${TEXT};">${escape(order.id)}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Items released</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
        ${itemRows}
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;">
        <tr>
          <td style="font-size:14px;color:${TEXT_MUTED};">Order total (not charged)</td>
          <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:${TEXT_MUTED};text-decoration:line-through;">${formattedTotal}</td>
        </tr>
      </table>

      ${ctaButton(`${BASE_URL}/products`, "Browse the collection")}

      <p style="margin:24px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5;">
        Changed your mind? You can place a new order any time — the items are already back in stock. If you cancelled by mistake, just reply to this email and we'll help.
      </p>
      <p style="margin:18px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Order cancelled · ${order.id}

Hi ${firstName},

We've cancelled your order. Nothing further is needed from you — because it hadn't shipped, you owe us nothing.

Cancelled items:
${order.items.map((i) => `· ${i.quantity}× ${i.name}`).join("\n")}

Order total (not charged): ${formattedTotal}

Browse the collection: ${BASE_URL}/products

Cancelled by mistake? Just reply to this email.

— The BagsArt team`;

  return { html, text };
}

/* ─── Order cancelled — admin notification ────────────────────────────── */

export function orderCancelledAdminTemplate(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  itemCount: number;
  reason?: string;
}): { html: string; text: string } {
  const formattedTotal = `Rs ${Math.round(order.total).toLocaleString("en-PK")}`;

  const html = shell({
    preheader: `Cancellation from ${order.customerName} — ${order.itemCount} items released.`,
    title: `Order ${order.id} cancelled`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Cancellation</p>
      <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        ${escape(order.customerName)} cancelled their order.
      </h1>
      <p style="margin:0 0 22px;font-size:14px;color:${TEXT_MUTED};">
        Stock has been restored automatically. The order status is now <strong>cancelled</strong> in the admin panel.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;margin:0 0 18px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Order</p>
            <p style="margin:0 0 12px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:13px;color:${TEXT};">${escape(order.id)}</p>
            <p style="margin:0 0 4px;font-size:13px;color:${TEXT};">
              <strong>${escape(order.customerName)}</strong> · <a href="mailto:${escape(order.customerEmail)}" style="color:${GOLD_DARK};text-decoration:none;">${escape(order.customerEmail)}</a>
            </p>
            ${
              order.customerPhone
                ? `<p style="margin:0 0 4px;font-size:13px;color:${TEXT};">
              <a href="tel:${escape(order.customerPhone)}" style="color:${GOLD_DARK};text-decoration:none;font-family:'SF Mono',Menlo,Consolas,monospace;">${escape(order.customerPhone)}</a>
            </p>`
                : ""
            }
            <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">
              ${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · ${formattedTotal}
            </p>
          </td>
        </tr>
      </table>

      ${
        order.reason
          ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff8eb;border-left:3px solid ${GOLD};border-radius:8px;margin:0 0 18px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${GOLD_DARK};">Customer's reason</p>
            <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.55;">${escape(order.reason)}</p>
          </td>
        </tr>
      </table>`
          : ""
      }

      ${ctaButton(`${BASE_URL}/admin/orders/${order.id}`, "Open in admin panel")}
    `,
  });

  const text = `Order cancelled · ${order.id}

${order.customerName} <${order.customerEmail}> cancelled their order.
${order.itemCount} item(s), ${formattedTotal}. Stock has been restored.
${order.reason ? `Reason: ${order.reason}\n` : ""}
Open: ${BASE_URL}/admin/orders/${order.id}`;

  return { html, text };
}

/* ─── Password changed confirmation ───────────────────────────────────── */

export function passwordChangedTemplate(name: string): {
  html: string;
  text: string;
} {
  const firstName = name.split(" ")[0];

  const html = shell({
    preheader: "Your BagsArt password was just changed.",
    title: "Password updated",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Account security</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Password updated, ${escape(firstName)}.
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:${TEXT};line-height:1.55;">
        The password on your BagsArt account was just changed. If that was you, there's nothing more to do — this note is just for the record.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;background:#fff8eb;border-left:3px solid ${GOLD};border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${TEXT};line-height:1.55;">
            <strong style="color:${GOLD_DARK};">Wasn't you?</strong> Reset your password immediately with the button below and reply to this email — we'll help lock the account down.
          </td>
        </tr>
      </table>

      ${ctaButton(`${BASE_URL}/auth/forgot`, "Reset password")}

      <p style="margin:22px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Password updated

Hi ${firstName},

The password on your BagsArt account was just changed.

If that wasn't you, reset your password immediately: ${BASE_URL}/auth/forgot
Then reply to this email and we'll help lock the account down.

— The BagsArt team`;

  return { html, text };
}

/* ─── Contact form message (admin-facing) ────────────────────────────── */

export function contactMessageTemplate(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { html: string; text: string } {
  const subjectLabel: Record<string, string> = {
    order: "Order question",
    product: "Product enquiry",
    wholesale: "Wholesale enquiry",
    press: "Press / collaboration",
    other: "Something else",
  };
  const prettySubject = subjectLabel[input.subject] ?? input.subject;
  const timestamp = new Date().toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });

  // Preserve customer's line breaks in the rendered HTML.
  const messageHtml = escape(input.message).replace(/\n/g, "<br />");

  const html = shell({
    preheader: `${prettySubject} from ${input.name}`,
    title: `New message from ${input.name}`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Contact form</p>
      <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        New message from <span style="color:${GOLD_DARK};">${escape(input.name)}</span>.
      </h1>
      <p style="margin:0 0 22px;font-size:14px;color:${TEXT_MUTED};">
        ${escape(timestamp)} · via bagsart.com
      </p>

      <!-- From row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;margin:0 0 18px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">From</p>
            <p style="margin:0 0 10px;font-size:15px;color:${TEXT};font-weight:600;">${escape(input.name)}</p>
            <p style="margin:0;font-size:13px;">
              <a href="mailto:${escape(input.email)}" style="color:${GOLD_DARK};text-decoration:none;font-family:'SF Mono',Menlo,Consolas,monospace;">${escape(input.email)}</a>
            </p>
          </td>
        </tr>
      </table>

      <!-- Subject pill -->
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Subject</p>
      <p style="margin:0 0 18px;">
        <span style="display:inline-block;padding:6px 14px;background:${GOLD};color:${TEXT};border-radius:999px;font-size:13px;font-weight:600;letter-spacing:0.2px;">${escape(prettySubject)}</span>
      </p>

      <!-- Message body -->
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Message</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${CARD};border:1px solid ${BORDER};border-radius:12px;margin:0 0 22px;">
        <tr>
          <td style="padding:20px 22px;font-size:15px;line-height:1.65;color:${TEXT};">
            ${messageHtml}
          </td>
        </tr>
      </table>

      ${ctaButton(`mailto:${input.email}?subject=Re: ${encodeURIComponent(prettySubject)}`, "Reply to " + input.name.split(" ")[0])}

      <p style="margin:24px 0 0;font-size:12px;color:${TEXT_MUTED};">
        Just hit reply on this email to respond — it will go straight to ${escape(input.email)}.
      </p>
    `,
  });

  const text = `New message from ${input.name}

From: ${input.name} <${input.email}>
Subject: ${prettySubject}
Sent: ${timestamp}

${input.message}

--
Reply to this email to respond to the customer directly.`;

  return { html, text };
}

/* ─── Signup verification code ────────────────────────────────────────── */

export function verificationCodeTemplate(input: {
  name: string;
  code: string;
}): { html: string; text: string } {
  const firstName = input.name.split(" ")[0];

  // Space the digits so the code is easy to read at a glance in the inbox
  // preview and inside the email itself: e.g. "483 921".
  const spaced = input.code.replace(/(\d{3})(\d{3})/, "$1 $2");

  const html = shell({
    preheader: `Your BagsArt verification code: ${spaced}`,
    title: "Confirm your email",
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${TEXT_MUTED};">Account security</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${TEXT};font-weight:600;letter-spacing:-0.4px;">
        Confirm your email, ${escape(firstName)}.
      </h1>
      <p style="margin:0 0 22px;font-size:15px;color:${TEXT};">
        Enter the 6-digit code below on the verification page to activate your BagsArt account.
      </p>

      <!-- The code, treated like a display element -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;">
        <tr>
          <td align="center" style="padding:22px 16px;background:#f9f6ef;border:1px solid ${BORDER};border-radius:12px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${TEXT_MUTED};">Your code</p>
            <p style="margin:0;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:600;letter-spacing:8px;color:${TEXT};">
              ${escape(spaced)}
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 12px;font-size:13px;color:${TEXT_MUTED};">
        This code expires in <strong>15 minutes</strong>. If it does, just request a new one from the verification page.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0 0;background:#fff8eb;border-left:3px solid ${GOLD};border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${TEXT};">
            <strong style="color:${GOLD_DARK};">Didn't sign up?</strong> You can safely ignore this email — no BagsArt account is created until the code is verified.
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0;font-size:14px;color:${TEXT};">
        — The BagsArt team
      </p>
    `,
  });

  const text = `Confirm your BagsArt email

Hi ${firstName},

Your verification code is: ${spaced}

Enter it on the verification page to activate your account. The code expires in 15 minutes.

If you didn't sign up, you can safely ignore this email.

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
