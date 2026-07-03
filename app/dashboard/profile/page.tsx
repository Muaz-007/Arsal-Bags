import { AddressBook } from "@/components/dashboard/address-book";
import { PasswordForm } from "@/components/dashboard/password-form";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth-server";

/**
 * /dashboard/profile — account details + saved addresses.
 * Server component: pulls the user from the session so the form can
 * adapt to the sign-in provider (Google = lock email, credentials =
 * allow change-with-verification).
 */
export default async function ProfilePage() {
  const user = await requireUser();

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

      <section className="space-y-5">
        <h2 className="font-display text-2xl">Account</h2>
        <ProfileForm
          initialName={user.name ?? ""}
          initialEmail={user.email ?? ""}
          provider={user.provider}
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-2xl">Password</h2>
        <PasswordForm provider={user.provider} />
      </section>

      <AddressBook />
    </div>
  );
}
