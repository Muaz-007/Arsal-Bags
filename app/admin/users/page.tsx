import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listUsers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await listUsers();
  return (
    <div className="space-y-6">
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
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3 text-right">{u.ordersCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
