"use client";

import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional icon or element shown to the left of the label. */
  icon?: ReactNode;
}

/**
 * Custom dropdown — drop-in replacement for the native `<select>` with a
 * luxury treatment that matches the rest of the UI.
 *
 *  - Animated open/close (Framer Motion fade + lift)
 *  - Keyboard navigation: ArrowUp / ArrowDown / Home / End / Enter / Esc
 *  - Click-outside dismiss
 *  - Selected option marked with a check
 *  - Accessible: listbox semantics, aria-activedescendant
 *  - Consistent height with the rest of our form fields (h-10)
 */
export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
  align = "start",
  prefix,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "end";
  /** Small label rendered before the selected option, e.g. "Sort ·". */
  prefix?: string;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<Array<HTMLLIElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label ?? placeholder;

  // When the menu opens, sync highlight to the selected option (or 0).
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  // Scroll the highlighted item into view inside the menu.
  useEffect(() => {
    if (!open) return;
    optionsRef.current[highlight]?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function select(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setHighlight(options.length - 1);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(highlight);
      return;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2",
          "h-10 px-3 rounded-md border border-input bg-background text-sm",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selected?.icon}
          {prefix && (
            <span className="text-muted-foreground">{prefix}</span>
          )}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            aria-activedescendant={`${id}-opt-${highlight}`}
            ref={(node) => {
              // autoFocus the menu so keyboard nav works immediately
              node?.focus();
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-50 mt-1.5 max-h-72 overflow-auto",
              "min-w-full rounded-md border border-border bg-card shadow-xl",
              "p-1 outline-none",
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlight;
              return (
                <li
                  id={`${id}-opt-${idx}`}
                  key={opt.value || `__placeholder_${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  ref={(el) => {
                    optionsRef.current[idx] = el;
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => select(idx)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer text-sm",
                    "transition-colors",
                    isHighlighted ? "bg-muted text-foreground" : "text-foreground/90"
                  )}
                >
                  {opt.icon}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
