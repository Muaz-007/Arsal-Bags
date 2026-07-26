"use client";

import { useState } from "react";
import { Send, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

/**
 * Newsletter composer.
 *
 * Admin types a subject + plain-text body with paragraph breaks; we escape
 * HTML server-side inside the template and wrap paragraphs in `<p>` here
 * before submit, so the composer stays simple (no rich text editor) but
 * emails still get proper spacing.
 *
 * "Test send" delivers only to the admin's own email so we can preview
 * without spamming the list — critical when iterating on copy.
 */
export function NewsletterComposer({
  subscriberCount,
}: {
  subscriberCount: number;
}) {
  const push = useToast((s) => s.push);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState<"live" | "test" | null>(null);

  /**
   * Convert plain-text body into safe HTML: double-newline → paragraph,
   * single newline → `<br />`. Angle brackets get escaped so a stray `<3`
   * doesn't break the template. Deliberately no other formatting — if we
   * want bold/links later that's a proper editor's job.
   */
  function toHtml(text: string): string {
    const esc = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return text
      .trim()
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 16px;">${esc(p).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  async function send(test: boolean) {
    if (!heading.trim() || !body.trim()) {
      push({ title: "Subject and body are required", tone: "error" });
      return;
    }
    setSending(test ? "test" : "live");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          heading: heading.trim(),
          bodyHtml: toHtml(body),
          test,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        sent?: number;
        failed?: number;
        total?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        push({
          title: "Couldn't send",
          description: data.error ?? "Please try again.",
          tone: "error",
        });
        return;
      }
      push({
        title: test ? "Test sent" : "Newsletter sent",
        description: test
          ? "Check your inbox to preview."
          : `Delivered to ${data.sent}${
              data.failed ? ` (${data.failed} failed)` : ""
            } of ${data.total}.`,
        tone: "success",
      });
      if (!test) {
        setHeading("");
        setBody("");
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 space-y-5">
        <div>
          <p className="text-sm font-medium">Send a newsletter</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reaches all {subscriberCount} active subscriber
            {subscriberCount === 1 ? "" : "s"}. Test first, always.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nl-subject">Subject</Label>
          <Input
            id="nl-subject"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Freshly out of the workshop"
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nl-body">Body</Label>
          <Textarea
            id="nl-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder={
              "Hi,\n\nWe just finished the new Milano Shoulder in Cognac — small batch, hand-stitched, ready to ship.\n\nTake a look → https://bagsart.store/products\n\n— The BagsArt team"
            }
          />
          <p className="text-[11px] text-muted-foreground">
            Empty line = new paragraph. Plain URLs stay clickable in most
            email clients. No HTML support — keep it human.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => send(true)}
            loading={sending === "test"}
            disabled={sending !== null}
          >
            <TestTube className="h-4 w-4" /> Send test to me
          </Button>
          <Button
            type="button"
            variant="gold"
            onClick={() => {
              if (
                confirm(
                  `Send to all ${subscriberCount} active subscribers? This can't be undone.`
                )
              ) {
                send(false);
              }
            }}
            loading={sending === "live"}
            disabled={sending !== null || subscriberCount === 0}
          >
            <Send className="h-4 w-4" /> Send to everyone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
