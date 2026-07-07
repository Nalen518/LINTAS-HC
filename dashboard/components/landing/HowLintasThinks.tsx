import { Reveal } from "@/components/landing/Reveal";

// Figma: "How LINTAS thinks" frame (37:11). LANDING_COPY §6, ADR-010.
// Two-column split: copy left, a field reasoning-trace card right that traces
// the HS code field through the five pipeline stages to a resolved value.
const COPY = [
  "Most AI tools give you an answer and ask you to trust it. LINTAS shows you the path to every answer. Each document moves through five stages you can inspect, and each stage records what it found.",
  "The risk score works the same way. An XGBoost model weighs the extracted fields, and a SHAP breakdown ranks exactly which factors raised or lowered the score.",
  "You stay the decision-maker. LINTAS reads, checks, and explains. You review and approve every submission before it goes anywhere.",
];

const TRACE = [
  { stage: "Layout detection", value: "table region" },
  { stage: "Text recognition", value: "8471.30.00" },
  { stage: "Table structure", value: "row 4, col 3" },
  { stage: "Field mapping", value: "HS code" },
  { stage: "Language reasoning", value: "format valid" },
] as const;

export function HowLintasThinks() {
  return (
    <section className="mx-auto flex w-full max-w-page items-center gap-16 px-24 py-24">
      <Reveal className="flex w-[520px] shrink-0 flex-col gap-5">
        <span className="text-eyebrow uppercase text-muted-foreground">
          How LINTAS thinks
        </span>
        <h2 className="font-serif text-section text-foreground">
          Five stages you can inspect, from layout detection to final field.
        </h2>
        {COPY.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="text-base text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </Reveal>

      <Reveal delay={0.1} className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Field trace</span>
            <span className="rounded-sm border border-border bg-elevated px-2 py-[3px] font-mono text-mono-sm text-muted-foreground">
              HS code
            </span>
          </div>

          <div className="flex flex-col">
            {TRACE.map((row, i) => (
              <div key={row.stage}>
                {i > 0 && <span className="block h-px w-full bg-border" />}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="text-body-sm text-foreground">
                      {row.stage}
                    </span>
                  </div>
                  <span className="font-mono text-mono-sm text-muted-foreground">
                    {row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded bg-elevated px-3.5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-faint">Resolved field</span>
              <span className="font-mono text-xs text-foreground">
                HS code · 8471.30.00
              </span>
            </div>
            <span className="rounded-pill bg-success px-2.5 py-1 text-badge text-inverse">
              96%
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
