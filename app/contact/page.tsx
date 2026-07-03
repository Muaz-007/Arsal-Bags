import type { Metadata } from "next";
import { Facebook, Instagram, Mail, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

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

const CHANNELS: Channel[] = [
  {
    icon: Mail,
    label: "Email",
    value: "bags.art.pk@gmail.com",
    href: "mailto:bags.art.pk@gmail.com",
    note: "We reply within one business day.",
  },
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
                href="mailto:bags.art.pk@gmail.com"
                className="underline decoration-gold underline-offset-4"
              >
                bags.art.pk@gmail.com
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
