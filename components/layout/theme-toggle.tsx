"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme ?? theme : "light";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
    >
      {/* Both icons share the same grid cell (col-start-1 row-start-1) so
          they stack on top of each other and inherit `place-items-center`.
          One fades + rotates out as the other fades + rotates in. */}
      <Sun className="h-4 w-4 col-start-1 row-start-1 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="h-4 w-4 col-start-1 row-start-1 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
