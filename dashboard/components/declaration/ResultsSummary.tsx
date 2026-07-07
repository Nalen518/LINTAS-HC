import { cn } from "@/lib/utils";
import { RiskMeter } from "@/components/ui/risk-meter";
import { riskScore, topRiskFactors } from "@/lib/results";
import type { ExtractedFieldsSummary } from "@/lib/results";
import type { ValidateResponse } from "@/lib/api";

// Figma: Summary row (85:322), shown above the tabs on every Results screen.
// Three cards, all from real data: overall risk (validate), fields extracted
// (extract confidence), validation (validate warnings).
const RISK_TEXT: Record<ValidateResponse["risk_level"], string> = {
  Low: "text-risk-low",
  Medium: "text-risk-medium",
  High: "text-risk-high",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-card p-6">
      {children}
    </div>
  );
}

export function ResultsSummary({
  validation,
  fields,
}: {
  validation: ValidateResponse;
  fields: ExtractedFieldsSummary;
}) {
  const score = riskScore(validation);
  const warningCount = validation.warnings.length;
  const hasWarnings = warningCount > 0;

  return (
    <div className="flex items-stretch gap-5">
      <Card>
        <span className="text-body-sm text-faint">Overall risk</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-3xl font-medium",
              RISK_TEXT[validation.risk_level],
            )}
          >
            {validation.risk_level}
          </span>
          <span className="text-body-sm text-faint">
            risk score {score} / 100
          </span>
        </div>
        <RiskMeter score={score} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-faint">Top risk factors</span>
          <span className="text-body-sm text-muted-foreground">
            {topRiskFactors(validation) || "None"}
          </span>
        </div>
      </Card>

      <Card>
        <span className="text-body-sm text-faint">Fields extracted</span>
        <span className="text-3xl font-medium tabular-nums text-foreground">
          {fields.fieldCount}
        </span>
        <span className="text-body-sm text-faint">
          {Math.round(fields.avgConfidence * 100)}% average confidence
        </span>
      </Card>

      <Card>
        <span className="text-body-sm text-faint">Validation</span>
        <span
          className={cn(
            "text-3xl font-medium",
            hasWarnings ? "text-risk-medium" : "text-risk-low",
          )}
        >
          {warningCount} {warningCount === 1 ? "warning" : "warnings"}
        </span>
        <span className="truncate text-body-sm text-faint">
          {hasWarnings
            ? validation.warnings.map((w) => w.rule_id).join(" · ")
            : "all checks passed"}
        </span>
      </Card>
    </div>
  );
}
