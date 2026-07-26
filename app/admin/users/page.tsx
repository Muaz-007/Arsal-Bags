import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listSubscribers, listUsers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { SubscribersSection } from "@/components/admin/subscribers-section";
import { NewsletterComposer } from "@/components/admin/newsletter-composer";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, subscribers] = await Promise.all([
    listUsers(),
    listSubscribers(),
  ]);
  const activeSubscribers = subscribers.filter((s) => s.active).length;

  return (
    <div className="space-y-10">
      {/* ─── Users ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <header>
          <h1 className="font-display text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} accounts.
          </p>
        </header>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-right px-5 py-3">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant={u.role === "admin" ? "gold" : "outline"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">{u.ordersCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* ─── Newsletter subscribers + broadcast composer ─────────────── */}
      <section className="space-y-4">
        <header>
          <h2 className="font-display text-2xl">Newsletter</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeSubscribers} active subscriber
            {activeSubscribers === 1 ? "" : "s"} · {subscribers.length} total.
          </p>
        </header>

        <NewsletterComposer subscriberCount={activeSubscribers} />

        <SubscribersSection initial={subscribers} />
      </section>
    </div>
  );
}
