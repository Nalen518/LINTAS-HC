import { cn } from "@/lib/utils";

// Figma: Components → Metric card (68:19). Dashboard Home quick stats (FR-11.x).
// Width is fluid — the home grid decides column sizing.
export function MetricCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-6",
        className,
      )}
    >
      <p className="text-body-sm text-faint">{label}</p>
      <p className="text-3xl font-medium tabular-nums text-foreground">
        {value}
      </p>
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
