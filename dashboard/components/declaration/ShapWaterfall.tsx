import { cn } from "@/lib/utils";
import type { ShapFeature } from "@/lib/api";

// Figma: factor row inside "Results · Risk & SHAP" (85:527). PRD §5.4 FR-4.3.
// One SHAP factor from the XGBoost explanation: label + a horizontal
// contribution bar (width ∝ |value|, red raises / green lowers) + signed value.
export function ShapWaterfall({
  feature,
  maxAbs,
}: {
  feature: ShapFeature;
  /** Largest |value| across features, for bar normalization. */
  maxAbs: number;
}) {
  const raises = feature.value >= 0;
  const pct = Math.round(Math.abs(feature.value) * 100);
  const barWidth = maxAbs > 0 ? (Math.abs(feature.value) / maxAbs) * 100 : 0;

  return (
    <div className="flex items-center gap-4 py-3">
      <span className="min-w-0 flex-1 text-sm text-foreground">
        {feature.label}
      </span>
      <div className="hidden h-2.5 w-[240px] shrink-0 items-center md:flex">
        <div
          className={cn(
            "h-2.5 rounded-sm",
            raises ? "bg-risk-high" : "bg-risk-low",
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span
        className={cn(
          "w-[52px] shrink-0 text-right font-mono text-mono-sm",
          raises ? "text-risk-high" : "text-risk-low",
        )}
      >
        {raises ? "+" : "−"}
        {pct}%
      </span>
    </div>
  );
}
