"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Palette, SunMoon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { DEFAULT_MODE, DEFAULT_THEME, MODES, THEMES, type Mode, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function AppearancePanel() {
  const { theme, setTheme, mode, setMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeMode = mounted ? mode : DEFAULT_MODE;
  const activeTheme = mounted ? theme : DEFAULT_THEME;

  return (
    <div className="space-y-6">
      {/* Mode selection (Light / Dark) */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SunMoon className="size-4 text-muted-foreground" />
          Color Mode
        </h3>
        <p className="text-xs text-muted-foreground">
          Select dark or light interface for your device.
        </p>

        <div
          role="radiogroup"
          aria-label="Color mode"
          className="grid max-w-md grid-cols-2 gap-3"
        >
          {MODES.map((m) => (
            <ModeCard
              key={m}
              mode={m}
              isActive={m === activeMode}
              onPick={() => setMode(m)}
            />
          ))}
        </div>
      </div>

      {/* Accent Color Selection */}
      <div className="space-y-3 pt-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Palette className="size-4 text-muted-foreground" />
          Accent Color
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose a primary brand accent color for buttons, badges, charts, and highlights.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((tObj) => (
            <ThemeCard
              key={tObj.id}
              id={tObj.id}
              name={tObj.name}
              tagline={tObj.tagline}
              swatch={tObj.swatch}
              isActive={tObj.id === activeTheme}
              onPick={() => setTheme(tObj.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  mode,
  isActive,
  onPick,
}: {
  mode: Mode;
  isActive: boolean;
  onPick: () => void;
}) {
  const isLight = mode === "light";
  const Icon = isLight ? Sun : Moon;
  return (
    <button
      type="button"
      role="radio"
      onClick={onPick}
      aria-checked={isActive}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors cursor-pointer",
        isActive
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-border hover:bg-muted/40",
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-semibold capitalize text-foreground">
        {mode}
      </span>
      {isActive && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
          <Check className="h-3 w-3" />
          Active
        </span>
      )}
    </button>
  );
}

function ThemeCard({
  id,
  name,
  tagline,
  swatch,
  isActive,
  onPick,
}: {
  id: ThemeId;
  name: string;
  tagline: string;
  swatch: string;
  isActive: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      onClick={onPick}
      aria-checked={isActive}
      className={cn(
        "flex flex-col justify-between rounded-xl border bg-card p-4 text-left transition-all cursor-pointer",
        isActive
          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
          : "border-border hover:border-border hover:bg-muted/40",
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm"
              style={{ backgroundColor: swatch }}
            />
            <span className="text-sm font-semibold text-foreground">{name}</span>
          </div>
          {isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Check className="h-3 w-3" />
              Active
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {tagline}
        </p>
      </div>
    </button>
  );
}
