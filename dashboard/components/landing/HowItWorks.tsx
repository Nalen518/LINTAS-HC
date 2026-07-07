import {
  IconUpload,
  IconScan,
  IconChecklist,
  IconChartBar,
  IconSend,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHead } from "@/components/landing/SectionHead";

// Figma: "How it works" frame (34:9). LANDING_COPY §5, FR-8.4.
// Connected 5-node pipeline rail (Tabler outline icons per FIGMA_TOKENS §7).
// Step 02 lists the OCR pipeline stages as mono chips.
type Step = {
  n: string;
  title: string;
  icon: Icon;
  desc: string;
  chips?: readonly string[];
};

const STEPS: Step[] = [
  {
    n: "Step 01",
    title: "Upload",
    icon: IconUpload,
    desc: "Drop CI, PL, and BoL into three labeled slots. PDF, PNG, JPG.",
  },
  {
    n: "Step 02",
    title: "Extract",
    icon: IconScan,
    desc: "A five stage OCR and layout pipeline reads every field.",
    chips: ["Docling", "PaddleOCR", "LayoutLMv3", "TableTransformer", "Ollama"],
  },
  {
    n: "Step 03",
    title: "Validate",
    icon: IconChecklist,
    desc: "Permendag rule engine and cross-document checks flag mismatches.",
  },
  {
    n: "Step 04",
    title: "Explain",
    icon: IconChartBar,
    desc: "XGBoost risk score with SHAP shows exactly why the score is what it is.",
  },
  {
    n: "Step 05",
    title: "Submit",
    icon: IconSend,
    desc: "Generate CEISA-compliant JSON, simulated for demo, real on the roadmap.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto flex w-full max-w-page flex-col gap-16 px-24 py-24">
      <Reveal>
        <SectionHead
          eyebrow="How it works"
          heading="Upload three documents, review extracted fields, submit to CEISA."
        />
      </Reveal>
      <Reveal className="flex w-full items-start">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          return (
            <div key={step.n} className="flex flex-1 flex-col items-center gap-3.5">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === 0 ? "bg-transparent" : "bg-border",
                  )}
                />
                <span className="flex size-10 items-center justify-center rounded-pill border-[1.5px] border-border-emphasis bg-card">
                  <StepIcon size={20} stroke={2} className="text-primary" />
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === STEPS.length - 1 ? "bg-transparent" : "bg-border",
                  )}
                />
              </div>
              <div className="flex flex-col items-center gap-1.5 px-3 text-center">
                <span className="text-eyebrow uppercase text-primary">
                  {step.n}
                </span>
                <span className="text-h4 text-foreground">{step.title}</span>
                <p className="text-body-sm text-muted-foreground">{step.desc}</p>
                {step.chips && (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-sm border border-border bg-elevated px-2 py-[3px] font-mono text-mono-sm text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
