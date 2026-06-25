/**
 * Email service.
 *
 * In development this prints messages to the console — enough to verify
 * flows without setting up a provider. In production, swap the `transport`
 * variable for Resend / Postmark / SendGrid / SES — every call site already
 * uses the same `sendEmail()` signature.
 *
 * Example Resend swap:
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   transport = async ({ to, subject, text, html, replyTo }) => {
 *     await resend.emails.send({
 *       from: FROM, to, subject, text, html, reply_to: replyTo,
 *     });
 *   };
 */

interface EmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

const FROM = process.env.EMAIL_FROM ?? "BagsArt <hello@bagsart.dev>";

type Transport = (p: EmailPayload) => Promise<void>;

const consoleTransport: Transport = async (payload) => {
  console.log(
    "✉  [email/dev]",
    JSON.stringify(
      { from: FROM, ...payload, text: payload.text?.slice(0, 200) + "…" },
      null,
      2
    )
  );
};

// Swap this for a real provider in production.
const transport: Transport = consoleTransport;

export async function sendEmail(payload: EmailPayload) {
  try {
    await transport(payload);
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
