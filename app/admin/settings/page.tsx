import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store configuration and integration keys.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Store name</Label>
            <Input defaultValue="BagsArt Atelier" />
          </div>
          <div className="space-y-1.5">
            <Label>Support email</Label>
            <Input defaultValue="hello@bagsart.store" />
          </div>
          <Button variant="gold" size="sm">
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Stripe — {process.env.STRIPE_SECRET_KEY ? "connected" : "not configured"}</p>
          <p>Cloudinary — {process.env.CLOUDINARY_CLOUD_NAME ? "connected" : "not configured"}</p>
          <p>MySQL — {process.env.DATABASE_URL ? "connected" : "mock data mode"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
