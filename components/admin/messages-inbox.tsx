"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

const SUBJECT_LABELS: Record<string, string> = {
  order: "Order question",
  product: "Product enquiry",
  wholesale: "Wholesale enquiry",
  press: "Press / collaboration",
  other: "Something else",
};

/**
 * Admin inbox for contact-form submissions.
 *
 * Split view: message list on the left, selected message body on the right.
 * Selecting an unread row marks it read via PATCH; delete removes it. All
 * mutations are optimistic — server errors roll back and toast the failure.
 */
export function MessagesInbox({ initial }: { initial: MessageRow[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [items, setItems] = useState<MessageRow[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null
  );

  const selected = useMemo(
    () => items.find((m) => m.id === selectedId) ?? null,
    [items, selectedId]
  );
  const unreadCount = items.filter((m) => !m.readAt).length;

  async function select(m: MessageRow) {
    setSelectedId(m.id);
    if (m.readAt) return;
    // Optimistic mark-read.
    setItems((arr) =>
      arr.map((x) =>
        x.id === m.id ? { ...x, readAt: new Date().toISOString() } : x
      )
    );
    const res = await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (!res.ok) {
      // Rollback + surface the failure.
      setItems((arr) =>
        arr.map((x) => (x.id === m.id ? { ...x, readAt: null } : x))
      );
      push({ title: "Couldn't mark read", tone: "error" });
    } else {
      router.refresh();
    }
  }

  async function remove(m: MessageRow) {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    const before = items;
    setItems((arr) => arr.filter((x) => x.id !== m.id));
    if (selectedId === m.id) {
      const nextId = items.find((x) => x.id !== m.id)?.id ?? null;
      setSelectedId(nextId);
    }
    const res = await fetch(`/api/admin/messages/${m.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setItems(before);
      push({ title: "Couldn't delete", tone: "error" });
    } else {
      push({ title: "Deleted", tone: "info" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact-form enquiries.{" "}
            {unreadCount > 0 ? (
              <>
                <strong>{unreadCount}</strong> unread of {items.length}.
              </>
            ) : (
              <>{items.length} total.</>
            )}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 font-display text-2xl">Inbox zero</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Nothing has come in through the contact form yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* List */}
          <Card className="overflow-hidden">
            <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
              <ul className="divide-y divide-border">
                {items.map((m) => {
                  const active = m.id === selectedId;
                  const unread = !m.readAt;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => select(m)}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-colors",
                          active
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1.5 h-2 w-2 rounded-full shrink-0",
                              unread ? "bg-gold" : "bg-transparent border border-border"
                            )}
                            aria-label={unread ? "Unread" : "Read"}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm truncate",
                                  unread ? "font-semibold" : "font-medium"
                                )}
                              >
                                {m.name}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formatDate(m.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {SUBJECT_LABELS[m.subject] ?? m.subject}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2">
                              {m.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card>
                  <CardContent className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Badge variant="outline" className="mb-2">
                          {SUBJECT_LABELS[selected.subject] ?? selected.subject}
                        </Badge>
                        <p className="font-display text-2xl truncate">
                          {selected.name}
                        </p>
                        <a
                          href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
                            SUBJECT_LABELS[selected.subject] ?? selected.subject
                          )}`}
                          className="text-sm text-muted-foreground hover:text-foreground break-all"
                        >
                          {selected.email}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Received {formatDate(selected.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a
                          href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
                            SUBJECT_LABELS[selected.subject] ?? selected.subject
                          )}`}
                          className="inline-flex items-center gap-2 h-9 px-3 text-sm rounded-md font-medium bg-gold text-black hover:bg-gold-light transition"
                        >
                          <Reply className="h-4 w-4" /> Reply
                        </a>
                        <button
                          type="button"
                          onClick={() => remove(selected)}
                          aria-label="Delete"
                          className="h-9 w-9 grid place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selected.message}
                      </p>
                    </div>

                    <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                      <MailOpen className="h-3 w-3" />
                      Marked read automatically when opened.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-16 text-center text-sm text-muted-foreground">
                  Select a message to read
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
