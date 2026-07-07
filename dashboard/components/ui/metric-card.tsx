import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Figma: "Dashboard — Home" metric (100:1032). Quick stat with a label, an
// elevated icon box top-right, a big number, and a hint (FR-11.x).
// `tone="danger"` colors the value + icon red (e.g. Flagged high risk).
export function MetricCard({
  label,
  value,
  hint,
  icon: MetricIcon,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: Icon;
  tone?: "default" | "danger";
  className?: string;
}) {
  const isDanger = tone === "danger";
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-faint">{label}</span>
        {MetricIcon && (
          <span className="flex size-9 items-center justify-center rounded-md bg-elevated">
            <MetricIcon
              size={18}
              stroke={1.75}
              className={isDanger ? "text-destructive" : "text-faint"}
            />
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-3xl font-medium tabular-nums",
          isDanger ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </div>
  );
}
