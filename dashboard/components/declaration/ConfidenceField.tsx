import { cn } from "@/lib/utils";

// Figma: field row + confidence legend inside "Extracted Fields" (84:602).
// PRD §5.2 FR-2.3. Confidence thresholds per DESIGN_SYSTEM §2.5 / FIGMA_TOKENS
// §1.6: ≥85 high (green), 70–84 medium (amber), <70 low (red).
function tone(confidence: number): { dot: string; text: string } {
  if (confidence >= 0.85)
    return { dot: "bg-confidence-high", text: "text-confidence-high" };
  if (confidence >= 0.7)
    return { dot: "bg-confidence-medium", text: "text-confidence-medium" };
  return { dot: "bg-confidence-low", text: "text-confidence-low" };
}

/** Confidence pill — accepts a 0–1 score. */
export function ConfidencePill({ confidence }: { confidence: number }) {
  const t = tone(confidence);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-badge", t.text)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {Math.round(confidence * 100)}%
    </span>
  );
}

export function ConfidenceField({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string;
  confidence: number | null;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-b-0">
      <span className="w-[220px] shrink-0 text-body-sm text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">
        {value}
      </span>
      <span className="flex w-[90px] shrink-0 justify-end">
        {confidence !== null ? (
          <ConfidencePill confidence={confidence} />
        ) : (
          <span className="text-body-sm text-faint">—</span>
        )}
      </span>
    </div>
  );
}
