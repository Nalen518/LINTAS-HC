import { cn } from "@/lib/utils";

// Figma: Risk & SHAP screen → Risk meter (85:328). Linear segmented meter —
// green 0–40, amber 40–70, red 70–100 — with a marker dot at the score.
// Presents the FR-4.3 risk visualization as designed (linear, not radial).
const SEGMENTS = [
  { className: "bg-risk-low", widthPct: 40, label: "Low" },
  { className: "bg-risk-medium", widthPct: 30, label: "Medium" },
  { className: "bg-risk-high", widthPct: 30, label: "High" },
] as const;

export function RiskMeter({
  score,
  className,
}: {
  /** Risk score 0–100 (ml_risk_probability-derived, per API contract). */
  score: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className={cn("flex w-full max-w-[300px] flex-col gap-1.5", className)}>
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-pill">
          {SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className={cn("h-2", seg.className)}
              style={{ width: `${seg.widthPct}%` }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-card"
          style={{ left: `${clamped}%` }}
          aria-hidden
        />
      </div>
      <div className="flex text-xs text-faint">
        {SEGMENTS.map((seg) => (
          <span
            key={seg.label}
            className="text-center"
            style={{ width: `${seg.widthPct}%` }}
          >
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
