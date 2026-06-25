"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { AddressBook } from "@/components/dashboard/address-book";

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
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Your account
        </p>
        <h1 className="mt-3 font-display text-4xl">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Your account details and saved addresses.
        </p>
      </header>

      {/* Account details */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl">Account</h2>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input name="name" defaultValue={session?.user?.name ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={session?.user?.email ?? ""}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="gold" loading={saving}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Address book */}
      <AddressBook />
    </div>
  );
}
