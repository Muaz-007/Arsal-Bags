import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Border colour system:
 *   - Light mode: neutral `border-input` (defined in globals.css).
 *   - Dark mode: soft gold (`gold/40`) at rest, deeper gold (`gold-dark`) on
 *     focus. The site-wide gold focus ring (see globals.css) sits on top so
 *     keyboard focus is still clearly announced.
 */
const FIELD_BASE =
  "w-full rounded-md border border-input bg-background text-sm transition-colors " +
  "placeholder:text-muted-foreground " +
  "dark:border-gold/40 dark:hover:border-gold/60 dark:focus:border-gold-dark " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(FIELD_BASE, "h-10 px-3 py-2", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(FIELD_BASE, "min-h-[100px] px-3 py-2", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs uppercase tracking-[0.18em] text-muted-foreground",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";
