import nodemailer, { type Transporter } from "nodemailer";
import {
  emailChangeTemplate,
  newsletterBroadcastTemplate,
  newsletterWelcomeTemplate,
  orderCancelledAdminTemplate,
  orderCancelledCustomerTemplate,
  orderConfirmationTemplate,
  passwordChangedTemplate,
  passwordResetTemplate,
  reviewRequestTemplate,
  verificationCodeTemplate,
  welcomeTemplate,
} from "@/lib/email-templates";

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
  // Extra SMTP headers — e.g. List-Unsubscribe for newsletter mail so
  // Gmail/Outlook show a native one-click unsubscribe button.
  headers?: Record<string, string>;
}

const FROM = process.env.EMAIL_FROM ?? "BagsArt <hello@bagsart.store>";

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
    // Vercel Hobby caps function duration at 10s. If Gmail SMTP hangs we
    // want to fail fast so the surrounding checkout/signup still returns
    // its response inside the budget.
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
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
    headers: payload.headers,
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
  const { html, text } = welcomeTemplate(name);
  return sendEmail({
    to,
    subject: "Welcome to BagsArt",
    html,
    text,
  });
}

export async function sendOrderConfirmation(
  to: string,
  order: {
    id: string;
    customerName: string;
    total: number;
    items: { name: string; quantity: number }[];
  }
) {
  const { html, text } = orderConfirmationTemplate(order);
  return sendEmail({
    to,
    subject: `Order confirmed · ${order.id}`,
    html,
    text,
  });
}

export async function sendReviewRequest(
  to: string,
  order: {
    id: string;
    customerName: string;
    items: { name: string; image: string; slug: string }[];
  }
) {
  const { html, text } = reviewRequestTemplate(order);
  return sendEmail({
    to,
    subject: `How did your BagsArt order land?`,
    html,
    text,
  });
}

export async function sendNewsletterWelcome(
  to: string,
  unsubscribeUrl: string
) {
  const { html, text } = newsletterWelcomeTemplate({ unsubscribeUrl });
  // List-Unsubscribe headers are picked up by Gmail/Outlook to show a
  // native "Unsubscribe" button next to the sender — massive spam-folder
  // avoidance signal. Both header + `mailto` variant included.
  return sendEmail({
    to,
    subject: "You're on the BagsArt list",
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export async function sendNewsletterBroadcast(
  to: string,
  input: { heading: string; bodyHtml: string; unsubscribeUrl: string }
) {
  const { html, text } = newsletterBroadcastTemplate(input);
  return sendEmail({
    to,
    subject: input.heading,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export async function sendPasswordReset(to: string, link: string) {
  const { html, text } = passwordResetTemplate(link);
  return sendEmail({
    to,
    subject: "Reset your BagsArt password",
    html,
    text,
  });
}

export async function sendEmailChangeVerification(to: string, link: string) {
  const { html, text } = emailChangeTemplate(link);
  return sendEmail({
    to,
    subject: "Confirm your new BagsArt email",
    html,
    text,
  });
}

export async function sendVerificationCode(
  to: string,
  name: string,
  code: string
) {
  const { html, text } = verificationCodeTemplate({ name, code });
  return sendEmail({
    to,
    subject: `Your BagsArt verification code: ${code}`,
    html,
    text,
  });
}

export async function sendOrderCancelledCustomer(
  to: string,
  order: {
    id: string;
    customerName: string;
    total: number;
    items: { name: string; quantity: number }[];
  }
) {
  const { html, text } = orderCancelledCustomerTemplate(order);
  return sendEmail({
    to,
    subject: `Order cancelled · ${order.id}`,
    html,
    text,
  });
}

export async function sendOrderCancelledAdmin(
  to: string,
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    total: number;
    itemCount: number;
    reason?: string;
  }
) {
  const { html, text } = orderCancelledAdminTemplate(order);
  return sendEmail({
    to,
    subject: `[Cancelled] ${order.id} · ${order.customerName}`,
    html,
    text,
  });
}

export async function sendPasswordChangedConfirmation(to: string, name: string) {
  const { html, text } = passwordChangedTemplate(name);
  return sendEmail({
    to,
    subject: "Your BagsArt password was updated",
    html,
    text,
  });
}

