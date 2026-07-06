import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Figma: "New declaration — Processing" frame (75:620). PRD §5.2 FR-2.4.
// MINIMAL version so the upload → processing route works end-to-end; the
// full per-stage progress design (75:620) replaces this in step 5.
// Degraded fallback state lives in ExtractionDegraded.tsx.
const PIPELINE_STAGES = [
  "Docling",
  "PaddleOCR",
  "LayoutLMv3",
  "TableTransformer",
  "Ollama",
] as const;

export function ExtractionProgress({
  status,
  runtimeSeconds,
}: {
  status: "running" | "done";
  runtimeSeconds?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-12">
      {status === "running" ? (
        <IconLoader2 size={28} stroke={2} className="animate-spin text-primary" />
      ) : (
        <IconCheck size={28} stroke={2} className="text-success" />
      )}
      <p className="text-sm font-medium text-foreground">
        {status === "running"
          ? "Extracting data from your documents"
          : "Extraction complete"}
      </p>
      <div className="flex gap-2">
        {PIPELINE_STAGES.map((stage) => (
          <span
            key={stage}
            className={cn(
              "rounded border border-border bg-elevated px-2.5 py-1 font-mono text-xs",
              status === "running" ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {stage}
          </span>
        ))}
      </div>
      {status === "done" && runtimeSeconds !== undefined && (
        <p className="text-xs text-faint">
          Finished in {runtimeSeconds.toFixed(1)} s — review screens arrive in
          build step 5.
        </p>
      )}
    </div>
  );
}
