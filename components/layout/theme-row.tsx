"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Segmented Light / Dark switcher for the mobile drawer.
 * Bigger tap target than the navbar icon, plus an explicit "Appearance"
 * label so the control reads at a glance.
 */
export function ThemeRow() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme ?? theme ?? "light" : "light";

  const options: { value: "light" | "dark"; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5">
      <span className="text-sm">Appearance</span>
      <div className="flex p-1 rounded-full border border-border bg-muted/50">
        {options.map(({ value, icon: Icon, label }) => {
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-label={`Switch to ${label.toLowerCase()} theme`}
              aria-pressed={active}
              className={cn(
                "h-7 w-9 grid place-items-center rounded-full transition-colors",
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
