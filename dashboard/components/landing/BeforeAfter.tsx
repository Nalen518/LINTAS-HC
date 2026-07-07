import { Reveal } from "@/components/landing/Reveal";
import { SectionHead } from "@/components/landing/SectionHead";

// Figma: "Before / After" frame (38:13). LANDING_COPY §7, FR-8.7 as amended
// by ADR-012 (workflow contrast, NO invented metrics) and ADR-014 (single
// integrated split panel). Left half plain, right half emerald-tinted.
const MANUAL = [
  "Retype every field from three documents by hand",
  "Check each Permendag rule manually",
  "Cross-check weights and values across documents yourself",
  "Submit with no visibility into why something might be flagged",
  "Find out about problems after a rejection",
];

const WITH_LINTAS = [
  "Fields extracted automatically, each with a confidence score",
  "Permendag rules checked automatically, every warning cited",
  "Cross-document mismatches surfaced with both source values",
  "Every risk score explained before you submit",
  "Catch problems before submission, not after",
];

export function BeforeAfter() {
  return (
    <section className="mx-auto flex w-full max-w-page flex-col gap-16 px-24 py-24">
      <Reveal>
        <SectionHead
          eyebrow="What changes for your team"
          heading="From retyping to reviewing."
        />
      </Reveal>
      <Reveal className="flex w-full overflow-hidden rounded-lg border border-border bg-card">
        {/* Manual filing */}
        <div className="flex flex-1 flex-col gap-3 p-7">
          <h3 className="text-h4 text-muted-foreground">Manual filing</h3>
          {MANUAL.map((item) => (
            <p key={item} className="text-body-sm text-muted-foreground">
              <span className="mr-2">–</span>
              {item}
            </p>
          ))}
        </div>

        <span className="w-px self-stretch bg-border" />

        {/* With LINTAS */}
        <div className="flex flex-1 flex-col gap-3 bg-accent-subtle p-7">
          <h3 className="text-h4 text-primary">With LINTAS</h3>
          {WITH_LINTAS.map((item) => (
            <p key={item} className="text-body-sm text-foreground">
              <span className="mr-2 text-primary">✓</span>
              {item}
            </p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
