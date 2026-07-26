import type { Metadata } from "next";
import { Facebook, Instagram, Mail, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with BagsArt — orders, product questions, or to say hello.",
};

interface Channel {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  note: string;
  external?: boolean;
}

/**
 * WhatsApp brand glyph — inlined for the same reason as the footer:
 * Lucide doesn't ship this icon (trademark), so a small SVG keeps the
 * bundle lean without pulling another icon package.
 */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Turn a raw international WhatsApp number like `923439188668` into the
 * more scannable `+92 343 9188668` shape that Pakistani shoppers expect
 * to see on a business card / footer. Falls back to the raw string if
 * the number doesn't match the +92 pattern (defensive — the env var may
 * change).
 */
function formatWhatsAppDisplay(raw: string): string {
  const m = raw.match(/^92(\d{3})(\d{7})$/);
  if (!m) return `+${raw}`;
  return `+92 ${m[1]} ${m[2]}`;
}

// NEXT_PUBLIC_* variables are inlined at build time by Next.js, so this
// evaluates once during the build. Strip anything non-digit so `03..`,
// `+92 ..`, `92-300-..` all normalise the same way as the FAB.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

const CHANNELS: Channel[] = [
  {
    icon: Mail,
    label: "Email",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    note: "We reply within one business day.",
  },
  // WhatsApp is the default trust channel for Pakistani buyers — placed
  // second so it sits above the social profiles. Only rendered when the
  // env var is configured (unconfigured deploys stay silent).
  ...(WHATSAPP_NUMBER
    ? [
        {
          icon: WhatsAppGlyph,
          label: "WhatsApp",
          value: formatWhatsAppDisplay(WHATSAPP_NUMBER),
          href: `https://wa.me/${WHATSAPP_NUMBER}`,
          note: "Fastest for order updates — replies within a few hours.",
          external: true,
        } as Channel,
      ]
    : []),
  {
    icon: Instagram,
    label: "Instagram",
    value: "@bags_art_official",
    href: "https://www.instagram.com/bags_art_official/",
    note: "DMs open — expect a reply within a day.",
    external: true,
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "BagsArt",
    href: "https://www.facebook.com/share/14gt9w5emgu/",
    note: "Follow for new drops and behind-the-scenes.",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="container py-12 lg:py-20 max-w-5xl">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Say hello
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
          Get <span className="text-gradient-gold">in touch</span>.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Order question, product enquiry, or just want to share a photo of
          your bag in the wild — we'd love to hear from you.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        {/* Channels */}
        <div className="space-y-4">
          {CHANNELS.map(({ icon: Icon, label, value, href, note, external }) => (
            <a
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block rounded-2xl border border-border bg-card p-5 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-10 w-10 grid place-items-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
              </div>
              <p className="font-display text-lg">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{note}</p>
            </a>
          ))}

          <div className="rounded-2xl border border-dashed border-border p-5">
            <Send className="h-4 w-4 text-gold mb-2" />
            <p className="text-sm font-medium">Press &amp; collaborations</p>
            <p className="text-xs text-muted-foreground mt-1">
              Reach us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="underline decoration-gold underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        {/* Form */}
        <ContactForm />
      </div>
    </div>
  );
}
