"use client";

import { useState } from "react";
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

  function pickSaved(a: SavedAddress) {
    setSelected(a);
    setNewMode(false);
  }

  function useNew() {
    setSelected(null);
    setNewMode(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Prefer the picked saved address when present, otherwise read the form.
    const address = selected
      ? {
          name: selected.name,
          email: (form.get("email") as string) ?? session?.user?.email ?? "",
          address: selected.address,
          city: selected.city,
          country: selected.country,
          postal: selected.postal,
        }
      : {
          name: form.get("name"),
          email: form.get("email"),
          address: form.get("address"),
          city: form.get("city"),
          country: form.get("country"),
          postal: form.get("postal"),
        };

    const payload = {
      customer: address,
      items: lines,
      couponCode: coupon?.code,
      paymentMethod,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Checkout failed");
      }
      const data = await res.json();

      // Save the new address for next time, if the user opted in.
      if (authed && !selected && saveAddress) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: address.name,
            address: address.address,
            city: address.city,
            country: address.country,
            postal: address.postal,
          }),
        }).catch(() => null);
      }

      clear();
      router.push(`/checkout/success?order=${data.id}`);
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
                id="name"
                name="name"
                required={!selected}
                defaultValue={session?.user?.name ?? ""}
                disabled={!!selected}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={session?.user?.email ?? ""}
              />
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
                <Input id="address" name="address" required />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    required
                    defaultValue="Pakistan"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postal">Postal code</Label>
                  <Input id="postal" name="postal" required />
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
              className="text-left rounded-xl border border-dashed border-border p-4 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium text-sm">Card</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Soon
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Online payment is coming shortly.
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
          Place order · {formatPrice(total)}
        </Button>
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
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
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
