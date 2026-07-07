import { cn } from "@/lib/utils";
import { Badge, type RiskTone } from "@/components/ui/badge";

// Figma: Components → Table row (68:20). One declaration in the recent /
// history tables (FR-11.x, FR-12.x). Column widths from the Figma spec;
// the consignee cell flexes.
export type DeclarationStatus =
  | "submitted"
  | "in review"
  | "processing"
  | "draft";

const statusDot: Record<DeclarationStatus, string> = {
  submitted: "bg-success",
  "in review": "bg-warning",
  processing: "bg-info",
  draft: "bg-faint",
};

const statusLabel: Record<DeclarationStatus, string> = {
  submitted: "Submitted",
  "in review": "In review",
  processing: "Processing",
  draft: "Draft",
};

export function DeclarationRow({
  id,
  summary,
  date,
  risk,
  status,
  className,
}: {
  /** PIB number, e.g. "PIB-2026-0142" */
  id: string;
  /** e.g. "PT Sinar Jaya · 3 documents" */
  summary: string;
  /** Pre-formatted day-first date, e.g. "5 Jul 2026" */
  date: string;
  risk: RiskTone;
  status: DeclarationStatus;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-4 border-b border-border bg-card px-4",
        className,
      )}
    >
      <div className="w-[150px] shrink-0">
        <span className="font-mono text-xs text-foreground">{id}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-body-sm text-foreground">
          {summary}
        </span>
      </div>
      <div className="w-[110px] shrink-0 text-body-sm text-faint">{date}</div>
      <div className="w-[100px] shrink-0">
        <Badge tone={risk} />
      </div>
      <div className="flex w-[120px] shrink-0 items-center gap-1.5">
        <span className={cn("size-2 rounded-full", statusDot[status])} />
        <span className="text-body-sm text-muted-foreground">
          {statusLabel[status]}
        </span>
      </div>
    </div>
  );
}
