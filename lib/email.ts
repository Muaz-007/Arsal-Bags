import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email service.
 *
 * Two modes, picked at runtime:
 *
 *  - **SMTP** when `SMTP_HOST` is set in env. We lazily build a nodemailer
 *    transport on first use and reuse it for the lifetime of the process.
 *    Works with Gmail, Resend SMTP, Postmark SMTP, SES SMTP, etc.
 *
 *  - **Console** in dev / when SMTP isn't configured. Messages print to the
 *    logs so flows are verifiable without an email provider.
 *
 * Failures are swallowed — a transactional email going down should NEVER
 * roll back a successful checkout / signup.
 */

interface EmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

const FROM = process.env.EMAIL_FROM ?? "BagsArt <hello@bagsart.dev>";

let transporter: Transporter | null = null;
let transporterTried = false;

function getTransporter(): Transporter | null {
  if (transporterTried) return transporter;
  transporterTried = true;

  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    // Gmail (587) uses STARTTLS, which nodemailer enables when secure=false.
    // Set SMTP_SECURE=true for port 465 / implicit TLS.
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  return transporter;
}

async function send(payload: EmailPayload): Promise<void> {
  const t = getTransporter();

  if (!t) {
    console.log(
      "✉  [email/dev]",
      JSON.stringify(
        { from: FROM, ...payload, text: payload.text?.slice(0, 200) + "…" },
        null,
        2
      )
    );
    return;
  }

  await t.sendMail({
    from: FROM,
    to: Array.isArray(payload.to) ? payload.to.join(",") : payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo,
  });
}

export async function sendEmail(payload: EmailPayload) {
  try {
    await send(payload);
  } catch (err) {
    // Never let an email failure break a checkout / signup flow.
    console.error("✉  email failure", err);
  }
}

/* ─── Template helpers ────────────────────────────────────────────────── */

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to BagsArt",
    text: `Hi ${name},

Welcome to the atelier. Your account is set up — you can track orders, save favorites, and check out faster from any device.

If you have any questions, just reply to this email.

— The BagsArt team`,
  });
}

export async function sendOrderConfirmation(
  to: string,
  order: { id: string; customerName: string; total: number; items: { name: string; quantity: number }[] }
) {
  const lineSummary = order.items
    .map((i) => `· ${i.quantity}× ${i.name}`)
    .join("\n");

  return sendEmail({
    to,
    subject: `Order confirmed · ${order.id}`,
    text: `Hi ${order.customerName},

Thanks for ordering from BagsArt. Here's a summary:

${lineSummary}

Total: $${order.total.toFixed(2)}

You can track your order from your account page at any time.

— The BagsArt team`,
  });
}

export async function sendPasswordReset(to: string, link: string) {
  return sendEmail({
    to,
    subject: "Reset your BagsArt password",
    text: `We received a request to reset your password.

If this was you, click the link below to choose a new one. The link expires in one hour.

${link}

If it wasn't you, you can safely ignore this email.

— The BagsArt team`,
  });
}
