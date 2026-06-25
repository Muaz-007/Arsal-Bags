"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-10 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}
