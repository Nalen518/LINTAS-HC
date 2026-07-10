import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { resolveFieldPath } from "@/lib/results";
import type { ExtractResponse, ValidationWarning, ValidateResponse } from "@/lib/api";

// Figma: "Results · Validation" tab content (86:563). PRD §5.3 FR-3.x.
// Driven by validate.warnings[] (Permendag rules + cross-doc checks). Evidence
// chips resolve each warning's affected_fields against the real documents.
const SEVERITY: Record<
  ValidationWarning["severity"],
  { label: string; text: string; dot: string }
> = {
  high: { label: "High", text: "text-destructive", dot: "bg-destructive" },
  medium: { label: "Warning", text: "text-warning", dot: "bg-warning" },
  low: { label: "Notice", text: "text-info", dot: "bg-info" },
};

const DOC_LABELS: Record<string, string> = {
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  bill_of_lading: "Bill of Lading",
};

function fieldChip(documents: ExtractResponse["documents"], path: string): string {
  const value = resolveFieldPath(documents, path);
  const root = path.split(/[.[]/)[0];
  const docLabel = DOC_LABELS[root];
  if (value && docLabel) return `${docLabel} · ${value}`;
  if (value) return value;
  return path;
}

function WarningCard({
  warning,
  documents,
}: {
  warning: ValidationWarning;
  documents: ExtractResponse["documents"];
}) {
  const severity = SEVERITY[warning.severity];
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
      <IconAlertTriangle
        size={20}
        stroke={1.75}
        className={cn("mt-0.5 shrink-0", severity.text)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-medium text-foreground">
            {warning.message}
          </span>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-badge",
              severity.text,
            )}
          >
            <span className={cn("size-1.5 rounded-full", severity.dot)} />
            {severity.label}
          </span>
        </div>
        <p className="text-body-sm text-muted-foreground">
          {warning.suggested_fix}
        </p>
        {warning.affected_fields.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {warning.affected_fields.map((path) => (
              <span
                key={path}
                className="rounded-sm border border-border bg-elevated px-2 py-1 font-mono text-mono-sm text-muted-foreground"
              >
                {fieldChip(documents, path)}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-faint">
          Permendag 16/2025 · {warning.rule_id}
        </span>
      </div>
    </div>
  );
}

export function ValidationTab({
  validation,
  documents,
}: {
  validation: ValidateResponse;
  documents: ExtractResponse["documents"];
}) {
  const { warnings, compliance_score } = validation;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Validation checks</h3>
        <p className="text-body-sm text-faint">
          Permendag rules and cross-document consistency · {warnings.length}{" "}
          {warnings.length === 1 ? "warning" : "warnings"} ·{" "}
          {Math.round(compliance_score)}% of rules passed
        </p>
      </div>

      {warnings.length > 0 ? (
        warnings.map((warning) => (
          <WarningCard
            key={warning.rule_id}
            warning={warning}
            documents={documents}
          />
        ))
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <IconCircleCheck size={20} stroke={1.75} className="text-success" />
          <span className="text-sm text-foreground">
            No issues found. All Permendag and cross-document checks passed.
          </span>
        </div>
      )}

      {/* Rule-compliance summary. The API returns compliance_score but not a
          named passed-checks list (see API_CONTRACT §2), so this shows the real
          score rather than fabricating individual check names. */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Rule compliance
          </span>
          <span className="text-body-sm text-faint">
            Share of Permendag rules this declaration passed
          </span>
        </div>
        <span className="text-2xl font-medium tabular-nums text-foreground">
          {Math.round(compliance_score)}%
        </span>
      </div>
    </div>
  );
}
