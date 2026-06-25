import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listCoupons } from "@/lib/queries";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promotional codes. {coupons.length} total.
          </p>
        </div>
        <Button variant="gold">
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </header>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Value</th>
                <th className="text-left px-5 py-3">Uses</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono">{c.code}</td>
                  <td className="px-5 py-3 capitalize">{c.type}</td>
                  <td className="px-5 py-3">
                    {c.type === "percent" ? `${c.value}%` : `$${c.value}`}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.uses}</td>
                  <td className="px-5 py-3">
                    <Badge variant={c.active ? "success" : "muted"}>
                      {c.active ? "Active" : "Paused"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
