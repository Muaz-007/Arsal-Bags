"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { SubscriberRow } from "@/lib/queries";

/**
 * Newsletter subscribers list + CSV export.
 *
 * Lives under the Users admin page as a section (deliberately not its own
 * route — audience data belongs together). Delete is a hard-delete for
 * cleanup / manual removal requests; the public unsubscribe flow flips
 * `active=false` instead so we keep churn history.
 */
export function SubscribersSection({ initial }: { initial: SubscriberRow[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [items, setItems] = useState<SubscriberRow[]>(initial);

  function downloadCsv() {
    // Simple CSV escape: wrap in quotes, double any interior quotes.
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = "email,source,active,joined";
    const rows = items.map((s) =>
      [
        esc(s.email),
        esc(s.source ?? ""),
        s.active ? "yes" : "no",
        esc(s.createdAt),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bagsart-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    push({ title: "CSV downloaded", tone: "success" });
  }

  async function remove(email: string) {
    if (!confirm(`Delete ${email} from the list? This can't be undone.`)) return;
    const before = items;
    // Optimistic
    setItems((arr) => arr.filter((s) => s.email !== email));
    const res = await fetch(
      `/api/admin/subscribers/${encodeURIComponent(email)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      setItems(before);
      push({ title: "Couldn't delete", tone: "error" });
      return;
    }
    push({ title: "Deleted", tone: "info" });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-0">
        <header className="px-5 py-4 flex items-center justify-between gap-3 border-b border-border">
          <div>
            <p className="text-sm font-medium">Subscribers</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Everyone who ever signed up. Export the list to move to
              Mailchimp / Beehiiv later.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadCsv}
            disabled={items.length === 0}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </header>

        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No subscribers yet. The homepage + footer forms will fill this up
            as visitors sign up.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Source</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((s) => (
                  <tr key={s.email} className="hover:bg-muted/30">
                    <td className="px-5 py-3 break-all">{s.email}</td>
                    <td className="px-5 py-3 text-muted-foreground capitalize">
                      {s.source ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={s.active ? "success" : "muted"}>
                        {s.active ? "Active" : "Unsubscribed"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => remove(s.email)}
                        className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
