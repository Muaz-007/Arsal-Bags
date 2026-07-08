"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Banknote, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { SavedAddressPicker } from "@/components/checkout/saved-address-picker";
import type { SavedAddress } from "@/types/address";

// Persist the in-progress checkout form across a guest → login → back-to-
// checkout round-trip. The user fills the form, clicks Place Order, gets
// bounced to /auth/login, comes back — and their inputs are still there.
// Cleared on a successful order and when the user's session identity changes
// (defensive: don't leak one buyer's typed address to another).
const DRAFT_KEY = "bagsart-checkout-draft";

type CheckoutDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal: string;
  paymentMethod: "cod" | "card";
  savedAt: number;
};

function readDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutDraft;
    // 24-hour TTL — old drafts get discarded so we don't restore a stale
    // address the user has clearly abandoned.
    if (Date.now() - parsed.savedAt > 24 * 60 * 60_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(d: Omit<CheckoutDraft, "savedAt">) {
  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...d, savedAt: Date.now() })
    );
  } catch {
    // Storage disabled — just skip. The redirect still happens.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // No-op.
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const authed = !!session?.user;
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping());
  const tax = useCart((s) => s.tax());
  const discount = useCart((s) => s.discount());
  const total = useCart((s) => s.total());
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const push = useToast((s) => s.push);

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SavedAddress | null>(null);
  const [newMode, setNewMode] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  // Restored guest draft (see writeDraft/readDraft). We hold it in state
  // so the inputs' defaultValues get the right values on the second render
  // pass — reading synchronously in render would misfire during SSR.
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);

  useEffect(() => {
    const d = readDraft();
    if (d) {
      setDraft(d);
      setPaymentMethod(d.paymentMethod);
    }
  }, []);

  function pickSaved(a: SavedAddress) {
    setSelected(a);
    setNewMode(false);
  }

  function useNew() {
    setSelected(null);
    setNewMode(true);
  }

  async function placeOrder(payloadBase: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      postal: string;
    };
    couponCode?: string;
  }) {
    const body = {
      ...payloadBase,
      items: lines,
      paymentMethod,
    };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? "Checkout failed");
    }
    const data = await res.json();

    // Save the new address for next time.
    if (!selected && saveAddress) {
      await fetch("/api/addresses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: payloadBase.customer.name,
          address: payloadBase.customer.address,
          city: payloadBase.customer.city,
          country: payloadBase.customer.country,
          postal: payloadBase.customer.postal,
        }),
      }).catch(() => null);
    }

    clearDraft();
    clear();
    router.push(`/checkout/success?order=${data.id}`);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const phone = String(form.get("phone") ?? "").trim();

    const address = selected
      ? {
          name: selected.name,
          email: (form.get("email") as string) ?? session?.user?.email ?? "",
          phone,
          address: selected.address,
          city: selected.city,
          country: selected.country,
          postal: selected.postal,
        }
      : {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone,
          address: String(form.get("address") ?? ""),
          city: String(form.get("city") ?? ""),
          country: String(form.get("country") ?? ""),
          postal: String(form.get("postal") ?? ""),
        };

    // Guest path: stash what they've typed and bounce to signup. When
    // NextAuth redirects back to /checkout, useEffect above restores the
    // form so they only have to click Place Order once more. Name + email
    // are passed on the URL so the signup form comes up pre-filled — an
    // existing customer can still switch to the Sign In tab and their
    // email will carry over.
    if (!authed) {
      writeDraft({
        name: address.name,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        country: address.country,
        postal: address.postal,
        paymentMethod,
      });
      const params = new URLSearchParams({
        callbackUrl: "/checkout",
      });
      if (address.name) params.set("name", address.name);
      if (address.email) params.set("email", address.email);
      router.push(`/auth/signup?${params.toString()}`);
      return;
    }

    const payloadBase = { customer: address, couponCode: coupon?.code };

    setLoading(true);
    try {
      await placeOrder(payloadBase);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Please try again.";
      push({ title: "Couldn't place order", description: message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container py-24 max-w-md text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <Button href="/products" className="mt-6" variant="gold">
          Browse the catalogue
        </Button>
      </div>
    );
  }

  // When a saved address is selected we hide the address inputs (still send
  // their values via the picked record). The email + name fields remain in
  // case the user wants to override the auto-filled contact.
  const showAddressInputs = !selected;

  return (
    <div className="container py-12 grid gap-10 lg:grid-cols-[1fr_400px]">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Checkout
          </p>
          <h1 className="mt-3 font-display text-4xl">Almost yours.</h1>
        </header>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg mb-1">Contact</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                key={`name-${draft?.name ?? "empty"}`}
                id="name"
                name="name"
                required={!selected}
                defaultValue={draft?.name ?? session?.user?.name ?? ""}
                disabled={!!selected}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                key={`email-${draft?.email ?? "empty"}`}
                id="email"
                name="email"
                type="email"
                required
                defaultValue={draft?.email ?? session?.user?.email ?? ""}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                key={`phone-${draft?.phone ?? "empty"}`}
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="03121234567 or +923121234567"
                required
                maxLength={20}
                defaultValue={draft?.phone ?? ""}
                // Accepts the same two formats the server enforces, with
                // spaces / dashes optional. Browser catches the typo in-
                // line before we round-trip to the API.
                pattern="^\s*(\+92[\s\-]?3\d{2}[\s\-]?\d{7}|03\d{2}[\s\-]?\d{7})\s*$"
                title="03XXXXXXXXX or +923XXXXXXXXX"
              />
              <p className="text-[11px] text-muted-foreground">
                Pakistani mobile only — we call before dispatch to confirm
                delivery details.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg mb-1">Shipping</legend>

          {/* Saved-address picker (signed-in only, returns null otherwise) */}
          <SavedAddressPicker
            onSelect={pickSaved}
            onUseNew={useNew}
            selectedId={selected?.id}
            newMode={newMode || (authed && !selected)}
          />

          {showAddressInputs && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="address">Street address</Label>
                <Input
                  key={`address-${draft?.address ?? "empty"}`}
                  id="address"
                  name="address"
                  required
                  defaultValue={draft?.address ?? ""}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    key={`city-${draft?.city ?? "empty"}`}
                    id="city"
                    name="city"
                    required
                    defaultValue={draft?.city ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    key={`country-${draft?.country ?? "empty"}`}
                    id="country"
                    name="country"
                    required
                    defaultValue={draft?.country ?? "Pakistan"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postal">Postal code</Label>
                  <Input
                    key={`postal-${draft?.postal ?? "empty"}`}
                    id="postal"
                    name="postal"
                    required
                    defaultValue={draft?.postal ?? ""}
                  />
                </div>
              </div>

              {authed && (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-gold"
                  />
                  Save this address to my profile for next time
                </label>
              )}
            </>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg mb-1 flex items-center gap-2">
            Payment <Lock className="h-4 w-4 text-muted-foreground" />
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={cn(
                "text-left rounded-xl border p-4 transition",
                paymentMethod === "cod"
                  ? "border-gold ring-1 ring-gold bg-gold/5"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Banknote className="h-4 w-4 text-gold" />
                <span className="font-medium text-sm">Cash on delivery</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Pay the courier when your order arrives.
              </p>
            </button>

            <button
              type="button"
              disabled
              aria-disabled
              className="text-left rounded-xl border border-dashed border-border p-4 opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium text-sm">Card / online</span>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Coming soon
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                We're setting up online payments — cash on delivery for now.
              </p>
            </button>
          </div>
        </fieldset>

        <Button
          type="submit"
          size="lg"
          variant="gold"
          className="w-full"
          loading={loading}
        >
          {authed
            ? `Place order · ${formatPrice(total)}`
            : `Sign in to place order · ${formatPrice(total)}`}
        </Button>
        {!authed && (
          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to sign in — your details are saved and this
            form will be waiting when you're back.
          </p>
        )}
      </motion.form>

      <aside className="lg:sticky lg:top-24 self-start glass rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-xl">Order summary</h2>
        <ul className="space-y-4">
          {lines.map((l) => (
            <li
              key={`${l.productId}-${l.color}`}
              className="grid grid-cols-[60px_1fr_auto] gap-3 items-center"
            >
              <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                <Image src={l.image} alt={l.name} fill className="object-cover" />
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-foreground text-background text-[10px]">
                  {l.quantity}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate">{l.name}</p>
                {l.color && (
                  <p className="text-xs text-muted-foreground">{l.color}</p>
                )}
              </div>
              <p className="text-sm">{formatPrice(l.price * l.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="hairline" />

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <dt>Discount</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          {tax > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
          )}
          <div className="hairline my-2" />
          <div className="flex justify-between font-display text-lg">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
      </aside>

    </div>
  );
}
