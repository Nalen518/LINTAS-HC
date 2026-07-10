import { ShapWaterfall } from "@/components/declaration/ShapWaterfall";
import { riskScore } from "@/lib/results";
import type { ValidateResponse } from "@/lib/api";

// Figma: "Results · Risk & SHAP" tab content (85:522). PRD §5.4 FR-4.x.
// Renders the real validate.shap_top_features, split by contribution sign —
// only groups the model actually returned are shown (no fabricated factors).
export function RiskShapTab({ validation }: { validation: ValidateResponse }) {
  const features = validation.shap_top_features;
  const raises = features.filter((f) => f.value >= 0);
  const reduces = features.filter((f) => f.value < 0);
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.value)), 0.0001);
  const score = riskScore(validation);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 pb-2">
        <h3 className="text-sm font-medium text-foreground">
          Why this declaration scored {validation.risk_level}
        </h3>
        <p className="text-body-sm text-faint">
          SHAP contribution of each factor to the {score} / 100 risk score. Red
          raises risk, green lowers it.
        </p>
      </div>

      {raises.length > 0 && (
        <>
          <span className="pt-3 text-xs font-medium text-faint">Raises risk</span>
          {raises.map((f) => (
            <ShapWaterfall key={f.feature} feature={f} maxAbs={maxAbs} />
          ))}
        </>
      )}

      {reduces.length > 0 && (
        <>
          <span className="mt-3 border-t border-border pt-4 text-xs font-medium text-faint">
            Reduces risk
          </span>
          {reduces.map((f) => (
            <ShapWaterfall key={f.feature} feature={f} maxAbs={maxAbs} />
          ))}
        </>
      )}

      <div className="mt-4 rounded bg-elevated px-3.5 py-3">
        <p className="text-body-sm text-muted-foreground">
          Result: {validation.risk_level} ({score} / 100). Review the flagged
          factors before submitting to CEISA.
        </p>
      </div>
    </div>
  );
}
