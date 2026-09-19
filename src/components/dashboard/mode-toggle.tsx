"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { toggleMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer",
        className,
      )}
    >
      {/* CSS-driven visibility guarantees 100% identical SSR and client DOM with zero hydration mismatch */}
      <Moon className="h-4 w-4 hidden dark:block transition-transform duration-200" />
      <Sun className="h-4 w-4 block dark:hidden transition-transform duration-200" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
