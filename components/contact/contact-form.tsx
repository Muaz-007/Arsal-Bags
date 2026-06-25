"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";

const SUBJECTS = [
  { value: "order", label: "Order question" },
  { value: "repair", label: "Repair / lifetime guarantee" },
  { value: "wholesale", label: "Wholesale enquiry" },
  { value: "press", label: "Press / collaboration" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const [subject, setSubject] = useState("order");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const push = useToast((s) => s.push);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const payload = Object.fromEntries(form.entries());
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, subject }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      push({
        title: "Message sent",
        description: "We'll get back to you within one business day.",
        tone: "success",
      });
    } catch {
      push({
        title: "Couldn't send",
        description: "Please try again or email hello@bagsart.dev directly.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-7 w-7" />
          </motion.div>
          <h2 className="mt-6 font-display text-2xl">Thanks for writing.</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            We've received your note and will reply within one business day —
            usually sooner.
          </p>
          <Button onClick={() => setSent(false)} variant="outline" className="mt-6">
            Send another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" required placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="you@studio.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>What's this about?</Label>
            <Dropdown
              value={subject}
              onChange={setSubject}
              options={SUBJECTS}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              name="message"
              required
              rows={6}
              placeholder="Tell us a bit more…"
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Send message
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            By sending, you agree to our{" "}
            <a
              href="/legal/privacy"
              className="underline decoration-gold underline-offset-4"
            >
              privacy policy
            </a>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
