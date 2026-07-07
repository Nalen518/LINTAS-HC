import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StageList, type PipelineStage } from "@/components/declaration/StageList";

// Figma: "New declaration — Extraction degraded" (100:1792). PRD FR-2.2 +
// ADR-003: a pipeline stage failed and LINTAS finished on the remaining
// stages (never crash the whole request — ARCHITECTURE §6). Warning banner +
// the stage list (failed stage marked skipped) + retry / continue actions.
export function ExtractionDegraded({
  stages,
  message,
  onRetry,
  onContinue,
}: {
  stages: PipelineStage[];
  message: string;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex w-[620px] max-w-full flex-col gap-[18px] rounded-lg border border-border bg-card px-7 pb-6 pt-7">
      <span className="text-xl font-medium text-foreground">
        Extraction finished with warnings
      </span>

      <div className="flex items-start gap-2.5 rounded bg-elevated p-3">
        <IconAlertTriangle
          size={18}
          stroke={1.75}
          className="mt-px shrink-0 text-warning"
        />
        <p className="text-body-sm text-muted-foreground">{message}</p>
      </div>

      <StageList stages={stages} />

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onRetry}>
          Retry extraction
        </Button>
        <Button onClick={onContinue}>Review results anyway</Button>
      </div>
    </div>
  );
}
