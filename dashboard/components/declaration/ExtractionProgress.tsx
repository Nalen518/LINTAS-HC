import { Button } from "@/components/ui/button";
import { StageList, type PipelineStage } from "@/components/declaration/StageList";

// Figma: "New declaration — Processing" → Processing card (75:648). PRD §5.2
// FR-2.4. Live pipeline progress: a track, a percentage, and the 5 stages.
// The percentage is derived from the stage statuses (a stage in progress
// counts as half), matching the Figma "50% complete / LayoutLMv3 processing".
export function ExtractionProgress({
  documentCount,
  stages,
  complete,
  onContinue,
}: {
  documentCount: number;
  stages: PipelineStage[];
  /** All stages resolved — swaps the footer note for a Continue action. */
  complete?: boolean;
  onContinue?: () => void;
}) {
  const done = stages.filter((s) => s.status === "done").length;
  const running = stages.filter((s) => s.status === "processing").length;
  const progress = Math.round(((done + 0.5 * running) / stages.length) * 100);

  return (
    <div className="mx-auto flex w-[600px] max-w-full flex-col gap-5 rounded-lg border border-border bg-card p-8">
      <div className="flex flex-col gap-1">
        <span className="text-xl font-medium text-foreground">
          {complete ? "Extraction complete" : "Extracting documents"}
        </span>
        <span className="text-body-sm text-faint">
          {documentCount} documents · {complete ? "ready to review" : "running locally"}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-pill bg-elevated">
        <div
          className="h-2 rounded-pill bg-primary transition-[width] duration-500 ease-out-expo"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-faint">{progress}% complete</span>

      <span className="h-px w-full bg-border" />

      <StageList stages={stages} />

      {complete && onContinue ? (
        <div className="flex justify-end">
          <Button onClick={onContinue}>Continue to review</Button>
        </div>
      ) : (
        <span className="text-body-sm text-faint">
          Runs locally on your machine — typically 30–60 seconds.
        </span>
      )}
    </div>
  );
}
