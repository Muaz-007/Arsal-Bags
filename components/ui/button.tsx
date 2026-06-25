"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 active:opacity-100",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "bg-transparent hover:bg-muted text-foreground",
  outline:
    "border border-border bg-transparent hover:bg-muted text-foreground",
  gold:
    "bg-gold text-black hover:bg-gold-light hover:shadow-[0_10px_36px_rgba(201,169,97,0.35)] shadow-[0_8px_30px_rgba(201,169,97,0.25)]",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-10 px-5 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-lg",
  icon: "h-9 w-9 rounded-full grid place-items-center",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, href, loading, children, disabled, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium select-none",
      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "active:scale-[0.97]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
      variants[variant],
      sizes[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
