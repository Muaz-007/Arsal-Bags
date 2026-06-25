import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

const banners = [
  { id: "hero", title: "Hero banner", subtitle: "Crafted bags, reimagined", active: true },
  { id: "seasonal", title: "Seasonal capsule", subtitle: "Summer Atelier 2026", active: true },
  { id: "shipping", title: "Free shipping bar", subtitle: "Free shipping over $250", active: false },
];

export default function CmsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage homepage banners, hero copy, and section content.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{b.title}</CardTitle>
              <Button variant="outline" size="sm">
                {b.active ? "Pause" : "Activate"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Headline</Label>
                <Input defaultValue={b.subtitle} />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea rows={3} placeholder="Optional body copy" />
              </div>
              <Button variant="gold" size="sm">
                Save changes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
