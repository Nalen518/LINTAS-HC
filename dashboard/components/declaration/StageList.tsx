import { IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Shared 5-stage pipeline list used by the Processing card (75:648) and the
// Degraded card (100:1792). Keys match docs/API_CONTRACT.md ocr_meta
// (`modules_used` and `errors[].stage`), so the UI is driven straight from
// the /api/extract response.
export type StageStatus = "done" | "processing" | "waiting" | "skipped";

export type PipelineStage = {
  name: string;
  desc: string;
  status: StageStatus;
};

export const PIPELINE_STAGES = [
  { key: "docling", name: "Docling", desc: "Document layout parsing" },
  { key: "paddleocr", name: "PaddleOCR", desc: "Text recognition (OCR)" },
  { key: "layoutlmv3", name: "LayoutLMv3", desc: "Field mapping" },
  { key: "tabletransformer", name: "TableTransformer", desc: "Table structure" },
  { key: "ollama", name: "Ollama", desc: "Language reasoning" },
] as const;

const STATUS_LABEL: Record<StageStatus, string> = {
  done: "Done",
  processing: "Processing…",
  waiting: "Waiting",
  skipped: "Skipped (fallback used)",
};

const STATUS_TEXT: Record<StageStatus, string> = {
  done: "text-faint",
  processing: "text-primary",
  waiting: "text-faint",
  skipped: "text-destructive",
};

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
        <IconCheck size={12} stroke={3} className="text-inverse" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
        <IconX size={11} stroke={3} className="text-inverse" />
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-border-strong border-t-primary" />
    );
  }
  return (
    <span className="size-5 shrink-0 rounded-full border-[1.5px] border-border-strong" />
  );
}

export function StageList({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      {stages.map((stage) => (
        <div key={stage.name} className="flex items-center gap-3">
          <StageIcon status={stage.status} />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <span
              className={cn(
                "text-sm font-medium",
                stage.status === "waiting" ? "text-faint" : "text-foreground",
              )}
            >
              {stage.name}
            </span>
            <span className="text-xs text-faint">{stage.desc}</span>
          </div>
          <span className={cn("text-body-sm", STATUS_TEXT[stage.status])}>
            {STATUS_LABEL[stage.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
