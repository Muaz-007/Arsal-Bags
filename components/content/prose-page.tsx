import { ReactNode } from "react";

/**
 * Shared content-page wrapper for Help / Legal / About pages.
 * Consistent typography, max width, and table-of-contents friendly anchors.
 */
export function ProsePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="container py-12 lg:py-20 max-w-3xl">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {intro}
          </p>
        )}
      </header>
      <div className="prose-content space-y-10">{children}</div>
    </article>
  );
}

export function ProseSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl tracking-tight mb-4">{title}</h2>
      <div className="text-foreground/85 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
