import { ConfidenceField } from "@/components/declaration/ConfidenceField";
import { flattenExtractedFields } from "@/lib/results";
import type { ExtractResponse } from "@/lib/api";

// Figma: "Results · Extracted Fields" tab content (84:602). PRD §5.2 FR-2.x.
// Driven entirely by the /api/extract documents + confidence_scores. Fields
// are grouped per source document (real data spans CI / PL / BoL).
function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function ExtractedFieldsTab({
  documents,
}: {
  documents: ExtractResponse["documents"];
}) {
  const { groups } = flattenExtractedFields(documents);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-sm font-medium text-foreground">Extracted fields</h3>
        <div className="flex items-center gap-4 text-xs text-faint">
          <LegendItem dot="bg-confidence-high" label="High ≥85%" />
          <LegendItem dot="bg-confidence-medium" label="Medium 70–84%" />
          <LegendItem dot="bg-confidence-low" label="Low <70%" />
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border px-5 pb-2.5 text-xs font-medium text-faint">
        <span className="w-[220px] shrink-0">Field</span>
        <span className="min-w-0 flex-1">Value</span>
        <span className="w-[90px] shrink-0 text-right">Confidence</span>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <div className="bg-elevated px-5 py-2 text-xs font-medium text-muted-foreground">
            {group.title}
          </div>
          {group.rows.map((row, i) => (
            <ConfidenceField key={`${group.title}-${i}`} {...row} />
          ))}
        </div>
      ))}
    </div>
  );
}
