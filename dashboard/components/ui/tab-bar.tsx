"use client";

import { cn } from "@/lib/utils";

// Figma: Results screens → Tabs (85:348). Underline style per DESIGN_SYSTEM §7:
// active tab gets a 2px emerald bar, inactive tabs are muted with a hover lift.
export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-7 border-b border-border", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2"
          >
            <span
              className={cn(
                "text-sm transition-colors duration-150 ease-out-expo",
                isActive
                  ? "font-medium text-foreground"
                  : "font-normal text-faint hover:text-foreground",
              )}
            >
              {tab.label}
            </span>
            <span
              className={cn("h-0.5 w-full", isActive ? "bg-primary" : "bg-transparent")}
            />
          </button>
        );
      })}
    </div>
  );
}
