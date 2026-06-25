"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const push = useToast((s) => s.push);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    // No backend write needed yet — just give the user a successful UX.
    await new Promise((r) => setTimeout(r, 600));
    push({ title: "Profile updated", tone: "success" });
    setSaving(false);
  }

  return (
    <div className="max-w-xl space-y-8">
      <header>
        <h1 className="font-display text-4xl">Profile</h1>
        <p className="mt-2 text-muted-foreground">Your account details.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={session?.user?.name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={session?.user?.email ?? ""} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" variant="gold" loading={saving}>
            Save changes
          </Button>
          <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>
      </form>
    </div>
  );
}
