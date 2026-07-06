import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Figma: Stepper (69:387 upload state, 85:300 review state). PRD §5.1–5.5.
// Completed = emerald disc + white check; current = emerald disc + white
// number; future = border-strong disc + muted number. 28px hairline
// connectors.
const STEPS = ["Upload", "Extract", "Review", "Submit"] as const;

export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center gap-3">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isCurrent = step === current;
        return (
          <li key={label} className="flex items-center gap-3">
            {i > 0 && <span className="h-px w-7 bg-border" />}
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-pill",
                  isCompleted || isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "border border-border-strong text-faint",
                )}
              >
                {isCompleted ? (
                  <IconCheck size={14} stroke={2.5} />
                ) : (
                  <span className="text-badge">{step}</span>
                )}
              </span>
              <span
                className={cn(
                  "text-body-sm",
                  isCompleted || isCurrent ? "text-foreground" : "text-faint",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
