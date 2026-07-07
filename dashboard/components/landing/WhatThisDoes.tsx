import { Reveal } from "@/components/landing/Reveal";
import { SectionHead } from "@/components/landing/SectionHead";

// Figma: "What this does" frame (23:4). LANDING_COPY §4, FR-8.3.
// Eyebrow + serif heading, then three numbered columns with hairline tops.
const COLUMNS = [
  {
    n: "01",
    body: "Every PIB declaration for Cikarang Dryport requires data from three separate documents. Today, your team retypes them field by field, checks each rule by hand, and submits with fingers crossed.",
  },
  {
    n: "02",
    body: "LINTAS reads the documents automatically, but that's just the start. Every extracted field carries a confidence score, every validation warning cites a Permendag rule, and every risk score comes with a SHAP explanation.",
  },
  {
    n: "03",
    body: "When something looks wrong, you know why, before you submit, not after CEISA rejects it.",
  },
] as const;

export function WhatThisDoes() {
  return (
    <section className="mx-auto flex w-full max-w-page flex-col gap-16 px-24 py-24">
      <Reveal>
        <SectionHead
          eyebrow="What this does"
          heading="Confidence scores, rule citations, and risk breakdowns for every field."
        />
      </Reveal>
      <Reveal className="flex gap-8">
        {COLUMNS.map((col) => (
          <div key={col.n} className="flex flex-1 flex-col gap-4">
            <span className="h-px w-full bg-border" />
            <span className="font-serif text-display text-primary">{col.n}</span>
            <p className="text-base text-muted-foreground">{col.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
