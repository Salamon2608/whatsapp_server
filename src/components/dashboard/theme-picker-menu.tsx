"use client";

import { Palette, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { THEMES, type ThemeId } from "@/lib/themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ThemePickerMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change theme accent"
          title="Change theme accent"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40",
            className,
          )}
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 p-2 rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="px-2 py-1.5 border-b border-border/50 mb-1">
          <p className="text-xs font-semibold text-foreground">Theme Accent</p>
          <p className="text-[11px] text-muted-foreground">Pick your dashboard accent color</p>
        </div>
        <div className="space-y-1">
          {THEMES.map((t) => {
            const isActive = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/70"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-sm"
                    style={{ backgroundColor: t.swatch }}
                  />
                  <span>{t.name}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
