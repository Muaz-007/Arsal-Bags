import type { Metadata } from "next";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with the BagsArt atelier — orders, repairs, press, or to say hello.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@bagsart.dev",
    href: "mailto:hello@bagsart.dev",
    note: "We reply within one business day.",
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: "+92 21 1234 5678",
    href: "https://wa.me/922112345678",
    note: "Mon–Sat · 10am–6pm PKT",
  },
  {
    icon: MapPin,
    label: "Atelier",
    value: "Karachi, Pakistan",
    href: "#",
    note: "By appointment only.",
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
          Talk to the <span className="text-gradient-gold">atelier</span>.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Order question, repair, wholesale enquiry, or just want to share a
          photo of your bag in the wild — we'd love to hear from you.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        {/* Channels */}
        <div className="space-y-4">
          {CHANNELS.map(({ icon: Icon, label, value, href, note }) => (
            <a
              key={label}
              href={href}
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
              Reach our press team at{" "}
              <a
                href="mailto:press@bagsart.dev"
                className="underline decoration-gold underline-offset-4"
              >
                press@bagsart.dev
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
