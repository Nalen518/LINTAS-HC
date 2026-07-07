import { cn } from "@/lib/utils";

// Figma: Components → Badge (62:24), Tone=Low/Medium/High.
// Risk-level pill per FR-4.x; label capitalized as a standalone status
// (copy rule: "High" as badge, "high-risk" in prose).
export type RiskTone = "low" | "medium" | "high";

const toneLabel: Record<RiskTone, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const toneText: Record<RiskTone, string> = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
};

const toneDot: Record<RiskTone, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

export function Badge({
  tone,
  size = "default",
  className,
}: {
  tone: RiskTone;
  /** "default" — bordered table pill; "sm" — compact borderless pill (Attention panel, 100:1132) */
  size?: "default" | "sm";
  className?: string;
}) {
  const isSm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill bg-elevated text-xs font-medium",
        isSm ? "px-2 py-[3px]" : "border border-border px-2.5 py-1",
        toneText[tone],
        className,
      )}
    >
      <span
        className={cn("rounded-full", isSm ? "size-1.5" : "size-2", toneDot[tone])}
      />
      {toneLabel[tone]}
    </span>
  );
}
