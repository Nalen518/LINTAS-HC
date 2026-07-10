import { ConfidencePill } from "@/components/declaration/ConfidenceField";
import type { PredictHsCodeResponse } from "@/lib/api";

// Figma: "Results · HS code" tab content (87:604). PRD §5.6 FR-6.x (W2).
// Shows the /api/predict-hs-code output for the primary item and whether it
// matches the code the OCR extracted (a mismatch is a real risk signal).
export function HsCodeTab({
  prediction,
  declaredHsCode,
  goodsDescription,
}: {
  prediction: PredictHsCodeResponse | null;
  declaredHsCode: string | null;
  goodsDescription: string | null;
}) {
  if (!prediction) {
    return (
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">
          HS code classification
        </h3>
        <p className="text-body-sm text-faint">
          Prediction unavailable. The classifier could not be reached. The
          declared code {declaredHsCode ?? "—"} will be used as-is.
        </p>
      </div>
    );
  }

  const normalized = (code: string) => code.replace(/\D/g, "");
  const matchesDeclared =
    declaredHsCode !== null &&
    normalized(prediction.suggested_hs_code).startsWith(
      normalized(declaredHsCode).slice(0, 6),
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">
          HS code classification
        </h3>
        <p className="text-body-sm text-faint">
          Predicted from the goods description. Confirm before submitting.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-faint">Goods description</span>
          <span className="text-body-sm text-foreground">
            {goodsDescription ?? "—"}
          </span>
        </div>
        <span className="h-px w-full bg-border" />
        <div className="flex flex-col gap-2">
          <span className="text-xs text-faint">Predicted HS code</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-base text-foreground">
              {prediction.suggested_hs_code}
            </span>
            <ConfidencePill confidence={prediction.confidence / 100} />
            <span className="rounded-sm bg-accent-subtle px-2 py-0.5 text-badge text-primary">
              {matchesDeclared ? "Matches declared" : "Differs from declared"}
            </span>
          </div>
          <p className="text-body-sm text-muted-foreground">
            {prediction.reasoning}
          </p>
          {!matchesDeclared && declaredHsCode && (
            <p className="text-body-sm text-destructive">
              Declared code {declaredHsCode} differs from the predicted code,
              this contributes to the risk score.
            </p>
          )}
        </div>
      </div>

      {prediction.alternative_codes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">
            Other candidates considered
          </span>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {prediction.alternative_codes.map((alt) => (
              <div
                key={alt.code}
                className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
              >
                <span className="w-[120px] shrink-0 font-mono text-mono-sm text-foreground">
                  {alt.code}
                </span>
                <span className="min-w-0 flex-1 text-body-sm text-muted-foreground">
                  {alt.reasoning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-body-sm text-faint">
        Confirm the code matches the actual goods before submitting. You can
        override the prediction if needed.
      </p>
    </div>
  );
}
